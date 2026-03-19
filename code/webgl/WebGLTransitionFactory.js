export class WebGLTransitionFactory {
  static vertexSource = `
    attribute vec2 a_position;
    attribute vec2 a_uv;
    varying vec2 v_uv;

    void main() {
      v_uv = a_uv;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  static fragmentHeader = `
    precision mediump float;

    uniform sampler2D u_from;
    uniform sampler2D u_to;
    uniform float progress;
    uniform float ratio;
    uniform vec4 bgcolor;

    varying vec2 v_uv;

    vec4 getFromColor(vec2 p) {
      return texture2D(u_from, p);
    }

    vec4 getToColor(vec2 p) {
      return texture2D(u_to, p);
    }
  `;

  static sharedUniforms = {
    u_from: { type: '1i' },
    u_to: { type: '1i' },
    progress: { type: '1f' },
    ratio: { type: '1f' },
    bgcolor: { type: '4f' }
  };

  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl');

    if (!this.gl) {
      throw new Error('WebGL not supported');
    }

    this.runtimeState = {
      duration: options.duration ?? 2000,
      bgcolor: options.bgcolor ?? [0.0, 0.0, 0.0, 1.0]
    };

    this.transitionDefs = [];
    this.transitions = [];
    this.transitionMap = new Map();
    this.transitionOverrides = new Map();

    this.active = null;
    this.activeParams = {};

    this.startTime = null;
    this.playing = true;
    this.rafId = null;

    this.buffer = null;
    this.textureFrom = null;
    this.textureTo = null;

    this._initGeometry();
    this._render = this._render.bind(this);
  }

  _initGeometry() {
    const gl = this.gl;

    const vertices = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
      -1,  1,  0, 1,
       1, -1,  1, 0,
       1,  1,  1, 1
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  _createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Shader compile error: ' + info + '\n\n' + source);
    }

    return shader;
  }

  _createProgram(vertexSource, fragmentSource) {
    const gl = this.gl;
    const vs = this._createShader(gl.VERTEX_SHADER, vertexSource);
    const fs = this._createShader(gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error('Program link error: ' + info);
    }

    return program;
  }

  _buildFragmentSource(def) {
    const uniformLines = Object.entries(def.uniforms || {})
      .map(([name, spec]) => {
        const glslTypeMap = {
          '1f': 'float',
          '1i': 'int',
          '2f': 'vec2',
          '3f': 'vec3',
          '4f': 'vec4'
        };

        return `uniform ${glslTypeMap[spec.type]} ${name};`;
      })
      .join('\n');

    return `
      ${WebGLTransitionFactory.fragmentHeader}
      ${uniformLines}

      ${def.glsl}

      void main() {
        gl_FragColor = transition(v_uv);
      }
    `;
  }

  _setUniform(location, type, value) {
    if (location === null) return;

    const gl = this.gl;

    switch (type) {
      case '1f':
        gl.uniform1f(location, value);
        break;
      case '1i':
        gl.uniform1i(location, value);
        break;
      case '2f':
        gl.uniform2f(location, value[0], value[1]);
        break;
      case '3f':
        gl.uniform3f(location, value[0], value[1], value[2]);
        break;
      case '4f':
        gl.uniform4f(location, value[0], value[1], value[2], value[3]);
        break;
      default:
        throw new Error('Unsupported uniform type: ' + type);
    }
  }

  _bindAttributes(locations) {
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;

    if (locations.a_position !== -1) {
      gl.enableVertexAttribArray(locations.a_position);
      gl.vertexAttribPointer(locations.a_position, 2, gl.FLOAT, false, stride, 0);
    }

    if (locations.a_uv !== -1) {
      gl.enableVertexAttribArray(locations.a_uv);
      gl.vertexAttribPointer(
        locations.a_uv,
        2,
        gl.FLOAT,
        false,
        stride,
        2 * Float32Array.BYTES_PER_ELEMENT
      );
    }
  }

  _resizeCanvas() {
    const gl = this.gl;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(this.canvas.clientWidth * dpr);
    const height = Math.floor(this.canvas.clientHeight * dpr);

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  _mergeParams(defaults, overrides) {
    return {
      ...structuredClone(defaults || {}),
      ...(overrides || {})
    };
  }

  _createTransition(def) {
    const gl = this.gl;
    const fragmentSource = this._buildFragmentSource(def);
    const program = this._createProgram(
      WebGLTransitionFactory.vertexSource,
      fragmentSource
    );

    const locations = {
      a_position: gl.getAttribLocation(program, 'a_position'),
      a_uv: gl.getAttribLocation(program, 'a_uv')
    };

    for (const name of Object.keys(WebGLTransitionFactory.sharedUniforms)) {
      locations[name] = gl.getUniformLocation(program, name);
    }

    for (const name of Object.keys(def.uniforms || {})) {
      locations[name] = gl.getUniformLocation(program, name);
    }

    return {
      name: def.name,
      label: def.label || def.name,
      defaults: structuredClone(def.defaults || {}),
      program,
      locations,
      bind: (runtimeState, params, runtime) => {
        this._setUniform(locations.u_from, '1i', 0);
        this._setUniform(locations.u_to, '1i', 1);
        this._setUniform(locations.progress, '1f', runtime.progress);
        this._setUniform(locations.ratio, '1f', runtime.ratio);
        this._setUniform(locations.bgcolor, '4f', runtimeState.bgcolor);

        for (const [name, spec] of Object.entries(def.uniforms || {})) {
          const value = spec.getValue(params, runtime, runtimeState);
          this._setUniform(locations[name], spec.type, value);
        }
      }
    };
  }

  register(def) {
    if (!def || !def.name) {
      throw new Error('Transition definition must include a name.');
    }

    if (this.transitionMap.has(def.name)) {
      throw new Error(`Transition "${def.name}" is already registered.`);
    }

    const transition = this._createTransition(def);

    this.transitionDefs.push(def);
    this.transitions.push(transition);
    this.transitionMap.set(transition.name, transition);

    if (!this.active) {
      this.active = transition;
      this.activeParams = this._mergeParams(
        transition.defaults,
        this.transitionOverrides.get(transition.name)
      );
    }

    return this;
  }

  registerMany(definitions) {
    definitions.forEach((def) => this.register(def));
    return this;
  }

  setTransition(indexOrName) {
    let next = null;

    if (typeof indexOrName === 'number') {
      if (indexOrName >= 0 && indexOrName < this.transitions.length) {
        next = this.transitions[indexOrName];
      }
    } else {
      next = this.transitionMap.get(indexOrName) || null;
    }

    if (!next) return this;

    this.active = next;
    this.activeParams = this._mergeParams(
      next.defaults,
      this.transitionOverrides.get(next.name)
    );

    this.playOnce();
    return this;
  }

  setTransitionParams(name, partial) {
    const transition = this.transitionMap.get(name);
    if (!transition) return this;

    const previous = this.transitionOverrides.get(name) || {};
    this.transitionOverrides.set(name, { ...previous, ...partial });

    if (this.active && this.active.name === name) {
      this.activeParams = this._mergeParams(
        this.active.defaults,
        this.transitionOverrides.get(name)
      );
    }

    return this;
  }

  getTransitionParams(name) {
    const transition = this.transitionMap.get(name);
    if (!transition) return null;

    return this._mergeParams(
      transition.defaults,
      this.transitionOverrides.get(name)
    );
  }

  setDuration(ms) {
    const value = Number(ms);
    if (!Number.isFinite(value) || value <= 0) return this;
    this.runtimeState.duration = value;
    return this;
  }

  setBackgroundColor(r, g, b, a = 1.0) {
    this.runtimeState.bgcolor = [r, g, b, a];
    return this;
  }

  playOnce(durationOverride) {
    if (durationOverride !== undefined) {
      this.setDuration(durationOverride);
    }

    this.startTime = null;
    this.playing = true;
    return this;
  }

  async loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image: ' + url));
      img.src = url;
    });
  }

  _createTexture(image, textureUnit) {
    const gl = this.gl;
    const texture = gl.createTexture();

    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );

    return texture;
  }

  setTextures(fromImage, toImage) {
    this.textureFrom = this._createTexture(fromImage, 0);
    this.textureTo = this._createTexture(toImage, 1);
    return this;
  }

  async setTexturesFromUrls(fromUrl, toUrl) {
    const [fromImage, toImage] = await Promise.all([
      this.loadImage(fromUrl),
      this.loadImage(toUrl)
    ]);

    this.setTextures(fromImage, toImage);
    return this;
  }

  mountButtons(container) {
    container.querySelectorAll('[data-transition-button="true"]').forEach((node) => {
      node.remove();
    });

    this.transitions.forEach((transition, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = transition.label;
      button.dataset.transitionButton = 'true';
      button.addEventListener('click', () => this.setTransition(index));
      container.appendChild(button);
    });

    return this;
  }

  start() {
    if (!this.active) {
      throw new Error('No transitions registered.');
    }

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(this._render);
    }

    return this;
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    return this;
  }

  _render(time) {
    const gl = this.gl;

    this._resizeCanvas();

    if (this.playing && this.startTime === null) {
      this.startTime = time;
    }

    let progress = 0.0;

    if (this.playing) {
      const elapsed = time - this.startTime;
      progress = Math.min(elapsed / this.runtimeState.duration, 1.0);

      if (progress >= 1.0) {
        this.playing = false;
      }
    } else {
      progress = 1.0;
    }

    const runtime = {
      progress,
      ratio: this.canvas.width / this.canvas.height
    };

    gl.clearColor(
      this.runtimeState.bgcolor[0],
      this.runtimeState.bgcolor[1],
      this.runtimeState.bgcolor[2],
      this.runtimeState.bgcolor[3]
    );
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.active.program);
    this._bindAttributes(this.active.locations);
    this.active.bind(this.runtimeState, this.activeParams, runtime);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.rafId = requestAnimationFrame(this._render);
  }
}