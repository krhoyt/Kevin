export const transitionLibrary = [
  {
    name: 'angular',
    label: 'Angular',
    defaults: {
      speed: 2.0
    },
    uniforms: {
      speed: { type: '1f', getValue: (params) => params.speed }
    },
    glsl: `
      vec4 transition(vec2 uv) {
        vec2 p = uv;

        float circPos = atan(p.y - 0.5, p.x - 0.5) + progress * speed;
        float modPos = mod(circPos, 3.1415 / 4.0);
        float signedValue = sign(progress - modPos);

        return mix(
          getToColor(p),
          getFromColor(p),
          step(signedValue, 0.5)
        );
      }
    `
  },  
  
  {
    name: 'crossfade',
    label: 'Crossfade',
    defaults: {},
    uniforms: {},
    glsl: `
      vec4 transition(vec2 p) {
        return mix(getFromColor(p), getToColor(p), progress);
      }
    `
  },
  
  {
    name: 'cross-zoom',
    label: 'Cross Zoom',
    defaults: {
      intensity: 0.1
    },
    uniforms: {
      intensity: { type: '1f', getValue: (params) => params.intensity }
    },
    glsl: `
      const int passes = 6;

      vec4 transition(vec2 uv) {
        vec4 c1 = vec4(0.0);
        vec4 c2 = vec4(0.0);

        float disp = intensity * (0.5 - distance(0.5, progress));

        for (int xi = 0; xi < passes; xi++) {
          float x = float(xi) / float(passes) - 0.5;

          for (int yi = 0; yi < passes; yi++) {
            float y = float(yi) / float(passes) - 0.5;
            vec2 v = vec2(x, y);
            float d = disp;

            c1 += getFromColor(uv + d * v);
            c2 += getToColor(uv + d * v);
          }
        }

        c1 /= float(passes * passes);
        c2 /= float(passes * passes);

        return mix(c1, c2, progress);
      }
    `
  },  

  {
    name: 'doorway',
    label: 'Doorway',
    defaults: {
      reflection: 0.4,
      perspective: 0.4,
      depth: 3.0
    },
    uniforms: {
      reflection: { type: '1f', getValue: (params) => params.reflection },
      perspective: { type: '1f', getValue: (params) => params.perspective },
      depth: { type: '1f', getValue: (params) => params.depth }
    },
    glsl: `
      const vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
      const vec2 boundMin = vec2(0.0, 0.0);
      const vec2 boundMax = vec2(1.0, 1.0);

      bool inBounds(vec2 p) {
        return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
      }

      vec2 project(vec2 p) {
        return p * vec2(1.0, -1.2) + vec2(0.0, -0.02);
      }

      vec4 bgColor(vec2 p, vec2 pto) {
        vec4 c = black;
        pto = project(pto);

        if (inBounds(pto)) {
          c += mix(
            black,
            getToColor(pto),
            reflection * mix(1.0, 0.0, pto.y)
          );
        }

        return c;
      }

      vec4 transition(vec2 p) {
        vec2 pfr = vec2(-1.0);
        vec2 pto = vec2(-1.0);

        float middleSlit = 2.0 * abs(p.x - 0.5) - progress;

        if (middleSlit > 0.0) {
          pfr = p + (p.x > 0.5 ? -1.0 : 1.0) * vec2(0.5 * progress, 0.0);

          float d = 1.0 / (1.0 + perspective * progress * (1.0 - middleSlit));
          pfr.y -= d / 2.0;
          pfr.y *= d;
          pfr.y += d / 2.0;
        }

        float size = mix(1.0, depth, 1.0 - progress);
        pto = (p - vec2(0.5)) * vec2(size) + vec2(0.5);

        if (inBounds(pfr)) {
          return getFromColor(pfr);
        } else if (inBounds(pto)) {
          return getToColor(pto);
        } else {
          return bgColor(p, pto);
        }
      }
    `
  },

  {
    name: 'slide-wrap',
    label: 'Slide Wrap',
    defaults: {
      direction: [0.0, 1.0]
    },
    uniforms: {
      direction: { type: '2f', getValue: (params) => params.direction }
    },
    glsl: `
      vec4 transition(vec2 p) {
        vec2 shifted = p + progress * sign(direction);
        vec2 wrapped = fract(shifted);

        float inBounds =
          step(0.0, shifted.y) *
          step(shifted.y, 1.0) *
          step(0.0, shifted.x) *
          step(shifted.x, 1.0);

        return mix(
          getToColor(wrapped),
          getFromColor(wrapped),
          inBounds
        );
      }
    `
  },

  {
    name: 'swap',
    label: 'Swap',
    defaults: {
      reflection: 0.4,
      perspective: 0.2,
      depth: 3.0
    },
    uniforms: {
      reflection: { type: '1f', getValue: (params) => params.reflection },
      perspective: { type: '1f', getValue: (params) => params.perspective },
      depth: { type: '1f', getValue: (params) => params.depth }
    },
    glsl: `
      const vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
      const vec2 boundMin = vec2(0.0, 0.0);
      const vec2 boundMax = vec2(1.0, 1.0);

      bool inBounds(vec2 p) {
        return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
      }

      vec2 project(vec2 p) {
        return p * vec2(1.0, -1.2) + vec2(0.0, -0.02);
      }

      vec4 bgColor(vec2 p, vec2 pfr, vec2 pto) {
        vec4 c = black;

        pfr = project(pfr);
        if (inBounds(pfr)) {
          c += mix(
            black,
            getFromColor(pfr),
            reflection * mix(1.0, 0.0, pfr.y)
          );
        }

        pto = project(pto);
        if (inBounds(pto)) {
          c += mix(
            black,
            getToColor(pto),
            reflection * mix(1.0, 0.0, pto.y)
          );
        }

        return c;
      }

      vec4 transition(vec2 p) {
        vec2 pfr = vec2(-1.0);
        vec2 pto = vec2(-1.0);

        float size = mix(1.0, depth, progress);
        float persp = perspective * progress;

        pfr = (p + vec2(0.0, -0.5)) *
          vec2(
            size / (1.0 - perspective * progress),
            size / (1.0 - size * persp * p.x)
          ) + vec2(0.0, 0.5);

        size = mix(1.0, depth, 1.0 - progress);
        persp = perspective * (1.0 - progress);

        pto = (p + vec2(-1.0, -0.5)) *
          vec2(
            size / (1.0 - perspective * (1.0 - progress)),
            size / (1.0 - size * persp * (0.5 - p.x))
          ) + vec2(1.0, 0.5);

        if (progress < 0.5) {
          if (inBounds(pfr)) {
            return getFromColor(pfr);
          }

          if (inBounds(pto)) {
            return getToColor(pto);
          }
        }

        if (inBounds(pto)) {
          return getToColor(pto);
        }

        if (inBounds(pfr)) {
          return getFromColor(pfr);
        }

        return bgColor(p, pfr, pto);
      }
    `
  },
  
  {
    name: 'squares-wire',
    label: 'Squares Wire',
    defaults: {
      squares: [10.0, 10.0],
      direction: [1.0, -0.5],
      smoothness: 1.6
    },
    uniforms: {
      squares: { type: '2f', getValue: (params) => params.squares },
      direction: { type: '2f', getValue: (params) => params.direction },
      smoothness: { type: '1f', getValue: (params) => params.smoothness }
    },
    glsl: `
      const vec2 center = vec2(0.5, 0.5);

      vec4 transition(vec2 p) {
        vec2 v = normalize(direction);
        v /= abs(v.x) + abs(v.y);

        float d = v.x * center.x + v.y * center.y;
        float offset = smoothness;

        float pr = smoothstep(
          -offset,
          0.0,
          v.x * p.x + v.y * p.y - (d - 0.5 + progress * (1.0 + offset))
        );

        vec2 squarep = fract(p * squares);
        vec2 squaremin = vec2(pr / 2.0);
        vec2 squaremax = vec2(1.0 - pr / 2.0);

        float a =
          (1.0 - step(progress, 0.0)) *
          step(squaremin.x, squarep.x) *
          step(squaremin.y, squarep.y) *
          step(squarep.x, squaremax.x) *
          step(squarep.y, squaremax.y);

        return mix(getFromColor(p), getToColor(p), a);
      }
    `
  },  

  {
    name: 'vertical-stripes',
    label: 'Vertical Stripes',
    defaults: {
      count: 10.0,
      smoothness: 0.5
    },
    uniforms: {
      count: { type: '1f', getValue: (params) => params.count },
      smoothness: { type: '1f', getValue: (params) => params.smoothness }
    },
    glsl: `
      vec4 transition(vec2 p) {
        float pr = smoothstep(
          -smoothness,
          0.0,
          p.x - progress * (1.0 + smoothness)
        );

        float s = step(pr, fract(count * p.x));
        return mix(getFromColor(p), getToColor(p), s);
      }
    `
  },
  
  {
    name: 'radial',
    label: 'Radial',
    defaults: {
      startingAngle: 90.0
    },
    uniforms: {
      startingAngle: { type: '1f', getValue: (params) => params.startingAngle }
    },
    glsl: `
      #define PI 3.141592653589

      vec4 transition(vec2 uv) {
        float offset = startingAngle * PI / 180.0;
        float angle = atan(uv.y - 0.5, uv.x - 0.5) + offset;
        float normalizedAngle = (angle + PI) / (2.0 * PI);

        normalizedAngle = normalizedAngle - floor(normalizedAngle);

        return mix(
          getFromColor(uv),
          getToColor(uv),
          step(normalizedAngle, progress)
        );
      }
    `
  },  

  {
    name: 'random-squares',
    label: 'Random Squares',
    defaults: {
      size: [10.0, 10.0],
      smoothness: 0.5
    },
    uniforms: {
      size: { type: '2f', getValue: (params) => params.size },
      smoothness: { type: '1f', getValue: (params) => params.smoothness }
    },
    glsl: `
      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      vec4 transition(vec2 p) {
        float r = rand(floor(size * p));
        float m = smoothstep(
          0.0,
          -smoothness,
          r - (progress * (1.0 + smoothness))
        );
        return mix(getFromColor(p), getToColor(p), m);
      }
    `
  },

  {
    name: 'dot-reveal',
    label: 'Dot Reveal',
    defaults: {
      dots: 20.0,
      center: [0.0, 0.0]
    },
    uniforms: {
      dots: { type: '1f', getValue: (params) => params.dots },
      center: { type: '2f', getValue: (params) => params.center }
    },
    glsl: `
      vec4 transition(vec2 p) {
        float d = max(distance(p, center), 0.0001);
        bool nextImage =
          distance(fract(p * dots), vec2(0.5, 0.5)) <
          (progress / d);

        return nextImage ? getToColor(p) : getFromColor(p);
      }
    `
  },

  {
    name: 'hexagonalize',
    label: 'Hexagonalize',
    defaults: {
      steps: 50.0,
      horizontalHexagons: 20.0
    },
    uniforms: {
      steps: { type: '1f', getValue: (params) => params.steps },
      horizontalHexagons: { type: '1f', getValue: (params) => params.horizontalHexagons }
    },
    glsl: `
      struct Hexagon {
        float q;
        float r;
        float s;
      };

      Hexagon createHexagon(float q, float r) {
        Hexagon hex;
        hex.q = q;
        hex.r = r;
        hex.s = -q - r;
        return hex;
      }

      Hexagon roundHexagon(Hexagon hex) {
        float q = floor(hex.q + 0.5);
        float r = floor(hex.r + 0.5);
        float s = floor(hex.s + 0.5);

        float deltaQ = abs(q - hex.q);
        float deltaR = abs(r - hex.r);
        float deltaS = abs(s - hex.s);

        if (deltaQ > deltaR && deltaQ > deltaS) {
          q = -r - s;
        } else if (deltaR > deltaS) {
          r = -q - s;
        } else {
          s = -q - r;
        }

        return createHexagon(q, r);
      }

      Hexagon hexagonFromPoint(vec2 point, float size) {
        point.y /= ratio;
        point = (point - 0.5) / size;

        float q = (sqrt(3.0) / 3.0) * point.x + (-1.0 / 3.0) * point.y;
        float r = 2.0 / 3.0 * point.y;

        Hexagon hex = createHexagon(q, r);
        return roundHexagon(hex);
      }

      vec2 pointFromHexagon(Hexagon hex, float size) {
        float x = (sqrt(3.0) * hex.q + (sqrt(3.0) / 2.0) * hex.r) * size + 0.5;
        float y = ((3.0 / 2.0) * hex.r) * size + 0.5;
        return vec2(x, y * ratio);
      }

      vec4 transition(vec2 p) {
        float dist = 2.0 * min(progress, 1.0 - progress);

        if (steps > 0.0) {
          dist = ceil(dist * steps) / steps;
        }

        float size = (sqrt(3.0) / 3.0) * dist / horizontalHexagons;
        vec2 point = dist > 0.0
          ? pointFromHexagon(hexagonFromPoint(p, size), size)
          : p;

        return mix(getFromColor(point), getToColor(point), progress);
      }
    `
  },
  
  {
    name: 'cylinder-curl',
    label: 'Cylinder Curl',
    defaults: {},
    uniforms: {},
    glsl: `
      const float MIN_AMOUNT = -0.16;
      const float MAX_AMOUNT = 1.5;
      const float PI = 3.141592653589793;
      const float scale = 512.0;
      const float sharpness = 3.0;

      const float angle = 100.0 * PI / 180.0;
      const float cylinderRadius = 1.0 / PI / 2.0;

      vec3 hitPoint(float hitAngle, float yc, vec3 point, mat3 rrotation) {
        float hitPointValue = hitAngle / (2.0 * PI);
        point.y = hitPointValue;
        return rrotation * point;
      }

      vec4 antiAlias(vec4 color1, vec4 color2, float distanc) {
        distanc *= scale;
        if (distanc < 0.0) return color2;
        if (distanc > 2.0) return color1;
        float dd = pow(1.0 - distanc / 2.0, sharpness);
        return ((color2 - color1) * dd) + color1;
      }

      float distanceToEdge(vec3 point) {
        float dx = abs(point.x > 0.5 ? 1.0 - point.x : point.x);
        float dy = abs(point.y > 0.5 ? 1.0 - point.y : point.y);

        if (point.x < 0.0) dx = -point.x;
        if (point.x > 1.0) dx = point.x - 1.0;
        if (point.y < 0.0) dy = -point.y;
        if (point.y > 1.0) dy = point.y - 1.0;

        if ((point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0)) {
          return sqrt(dx * dx + dy * dy);
        }

        return min(dx, dy);
      }

      vec4 seeThrough(
        float yc,
        vec2 p,
        mat3 rotation,
        mat3 rrotation,
        float cylinderAngle
      ) {
        float hitAngle = PI - (acos(yc / cylinderRadius) - cylinderAngle);
        vec3 point = hitPoint(hitAngle, yc, rotation * vec3(p, 1.0), rrotation);

        if (yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0)) {
          return getToColor(p);
        }

        if (yc > 0.0) return getFromColor(p);

        vec4 color = getFromColor(point.xy);
        vec4 tcolor = vec4(0.0);

        return antiAlias(color, tcolor, distanceToEdge(point));
      }

      vec4 seeThroughWithShadow(
        float yc,
        vec2 p,
        vec3 point,
        mat3 rotation,
        mat3 rrotation,
        float amount,
        float cylinderAngle
      ) {
        float shadow = distanceToEdge(point) * 30.0;
        shadow = (1.0 - shadow) / 3.0;

        if (shadow < 0.0) {
          shadow = 0.0;
        } else {
          shadow *= amount;
        }

        vec4 shadowColor = seeThrough(yc, p, rotation, rrotation, cylinderAngle);
        shadowColor.r -= shadow;
        shadowColor.g -= shadow;
        shadowColor.b -= shadow;

        return shadowColor;
      }

      vec4 backside(float yc, vec3 point) {
        vec4 color = getFromColor(point.xy);
        float gray = (color.r + color.b + color.g) / 15.0;
        gray += (8.0 / 10.0) * (
          pow(1.0 - abs(yc / cylinderRadius), 2.0 / 10.0) / 2.0 + (5.0 / 10.0)
        );
        color.rgb = vec3(gray);
        return color;
      }

      vec4 behindSurface(
        vec2 p,
        float yc,
        vec3 point,
        mat3 rrotation,
        float amount,
        float cylinderAngle
      ) {
        float shado = (1.0 - ((-cylinderRadius - yc) / amount * 7.0)) / 6.0;
        shado *= 1.0 - abs(point.x - 0.5);

        yc = (-cylinderRadius - cylinderRadius - yc);

        float hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;
        point = hitPoint(hitAngle, yc, point, rrotation);

        if (
          yc < 0.0 &&
          point.x >= 0.0 &&
          point.y >= 0.0 &&
          point.x <= 1.0 &&
          point.y <= 1.0 &&
          (hitAngle < PI || amount > 0.5)
        ) {
          shado = 1.0 - (
            sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / (71.0 / 100.0)
          );
          shado *= pow(-yc / cylinderRadius, 3.0);
          shado *= 0.5;
        } else {
          shado = 0.0;
        }

        return vec4(getToColor(p).rgb - shado, 1.0);
      }

      vec4 transition(vec2 p) {
        float amount = progress * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;
        float cylinderCenter = amount;
        float cylinderAngle = 2.0 * PI * amount;

        float c = cos(-angle);
        float s = sin(-angle);

        mat3 rotation = mat3(
          c,      s,      0.0,
         -s,      c,      0.0,
         -0.801,  0.8900, 1.0
        );

        c = cos(angle);
        s = sin(angle);

        mat3 rrotation = mat3(
          c,      s,     0.0,
         -s,      c,     0.0,
          0.9850, 0.985, 1.0
        );

        vec3 point = rotation * vec3(p, 1.0);
        float yc = point.y - cylinderCenter;

        if (yc < -cylinderRadius) {
          return behindSurface(p, yc, point, rrotation, amount, cylinderAngle);
        }

        if (yc > cylinderRadius) {
          return getFromColor(p);
        }

        float hitAngle = (acos(yc / cylinderRadius) + cylinderAngle) - PI;
        float hitAngleMod = mod(hitAngle, 2.0 * PI);

        if (
          (hitAngleMod > PI && amount < 0.5) ||
          (hitAngleMod > PI / 2.0 && amount < 0.0)
        ) {
          return seeThrough(yc, p, rotation, rrotation, cylinderAngle);
        }

        point = hitPoint(hitAngle, yc, point, rrotation);

        if (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0) {
          return seeThroughWithShadow(yc, p, point, rotation, rrotation, amount, cylinderAngle);
        }

        vec4 color = backside(yc, point);

        vec4 otherColor;
        if (yc < 0.0) {
          float shado = 1.0 - (
            sqrt(pow(point.x - 0.5, 2.0) + pow(point.y - 0.5, 2.0)) / 0.71
          );
          shado *= pow(-yc / cylinderRadius, 3.0);
          shado *= 0.5;
          otherColor = vec4(0.0, 0.0, 0.0, shado);
        } else {
          otherColor = getFromColor(p);
        }

        color = antiAlias(color, otherColor, cylinderRadius - abs(yc));

        vec4 cl = seeThroughWithShadow(yc, p, point, rotation, rrotation, amount, cylinderAngle);
        float dist = distanceToEdge(point);

        return antiAlias(color, cl, dist);
      }
    `
  },

  {
    name: 'page-curl',
    label: 'Page Curl',
    defaults: {
      persp: 0.7,
      unzoom: 0.3,
      reflection: 0.4,
      floating: 3.0
    },
    uniforms: {
      persp: { type: '1f', getValue: (params) => params.persp },
      unzoom: { type: '1f', getValue: (params) => params.unzoom },
      reflection: { type: '1f', getValue: (params) => params.reflection },
      floating: { type: '1f', getValue: (params) => params.floating }
    },
    glsl: `
      vec2 project(vec2 p) {
        return p * vec2(1.0, -1.2) + vec2(0.0, -floating / 100.0);
      }

      bool inBounds(vec2 p) {
        return all(lessThan(vec2(0.0), p)) && all(lessThan(p, vec2(1.0)));
      }

      vec4 bgColor(vec2 p, vec2 pfr, vec2 pto) {
        vec4 c = vec4(0.0, 0.0, 0.0, 1.0);

        pfr = project(pfr);
        if (inBounds(pfr)) {
          c += mix(vec4(0.0), getFromColor(pfr), reflection * mix(1.0, 0.0, pfr.y));
        }

        pto = project(pto);
        if (inBounds(pto)) {
          c += mix(vec4(0.0), getToColor(pto), reflection * mix(1.0, 0.0, pto.y));
        }

        return c;
      }

      vec2 xskew(vec2 p, float perspValue, float center) {
        float x = mix(p.x, 1.0 - p.x, center);

        return (
          (
            vec2(
              x,
              (p.y - 0.5 * (1.0 - perspValue) * x) /
              (1.0 + (perspValue - 1.0) * x)
            ) - vec2(0.5 - distance(center, 0.5), 0.0)
          ) * vec2(
            0.5 / distance(center, 0.5) * (center < 0.5 ? 1.0 : -1.0),
            1.0
          ) + vec2(center < 0.5 ? 0.0 : 1.0, 0.0)
        );
      }

      vec4 transition(vec2 op) {
        float t = clamp(progress, 0.0001, 0.9999);
        float uz = unzoom * 2.0 * (0.5 - distance(0.5, t));
        vec2 p = -uz * 0.5 + (1.0 + uz) * op;

        vec2 fromP = xskew(
          (p - vec2(t, 0.0)) / vec2(1.0 - t, 1.0),
          1.0 - mix(t, 0.0, persp),
          0.0
        );

        vec2 toP = xskew(
          p / vec2(t, 1.0),
          mix(pow(t, 2.0), 1.0, persp),
          1.0
        );

        if (inBounds(fromP)) {
          return getFromColor(fromP);
        } else if (inBounds(toP)) {
          return getToColor(toP);
        }

        return bgColor(op, fromP, toP);
      }
    `
  }
];