import { WebGLTransitionFactory } from './WebGLTransitionFactory.js';
import { transitionLibrary } from './transition-library.js';

const IMAGE_URLS = [
  'https://picsum.photos/id/1015/1200/800',
  'https://picsum.photos/id/1025/1200/800',
  'https://picsum.photos/id/1035/1200/800',
  'https://picsum.photos/id/1043/1200/800'
];

// Time the shader animation itself runs.
const TRANSITION_DURATION = 2000;

// Time to wait after one transition completes before starting the next.
const TRANSITION_DELAY = 3000;

function modulo(index, length) {
  return ((index % length) + length) % length;
}

async function preloadImages(factory, urls) {
  const uniqueUrls = [...new Set(urls)];
  const loadedPairs = await Promise.all(
    uniqueUrls.map(async (url) => [url, await factory.loadImage(url)])
  );

  return new Map(loadedPairs);
}

async function main() {
  const canvas = document.getElementById('glcanvas');
  const controls = document.getElementById('controls');
  const durationInput = document.getElementById('duration-input');
  const playButton = document.getElementById('play-button');

  const transitions = new WebGLTransitionFactory(canvas, {
    duration: TRANSITION_DURATION,
    bgcolor: [0.0, 0.0, 0.0, 1.0]
  });

  transitions.registerMany(transitionLibrary);

  const availableTransitionNames = transitionLibrary.map((transition) => transition.name);

  if (IMAGE_URLS.length === 0) {
    throw new Error('IMAGE_URLS must contain at least one image URL.');
  }

  if (availableTransitionNames.length === 0) {
    throw new Error('transitionLibrary must contain at least one transition.');
  }

  const imageCache = await preloadImages(transitions, IMAGE_URLS);

  let currentImageIndex = 0;
  let currentTransitionIndex = 0;
  let carouselTimeoutId = null;
  let isCarouselRunning = true;

  async function showImagePair(fromIndex, toIndex) {
    const normalizedFromIndex = modulo(fromIndex, IMAGE_URLS.length);
    const normalizedToIndex = modulo(toIndex, IMAGE_URLS.length);

    const fromUrl = IMAGE_URLS[normalizedFromIndex];
    const toUrl = IMAGE_URLS[normalizedToIndex];

    const fromImage = imageCache.get(fromUrl);
    const toImage = imageCache.get(toUrl);

    if (!fromImage || !toImage) {
      throw new Error('One or more carousel images failed to preload.');
    }

    transitions.setTextures(fromImage, toImage);
  }

  function applyCurrentTransition() {
    const transitionName =
      availableTransitionNames[modulo(currentTransitionIndex, availableTransitionNames.length)];

    transitions.setTransition(transitionName);
  }

  async function advanceCarousel() {
    if (!isCarouselRunning) return;

    const nextImageIndex = modulo(currentImageIndex + 1, IMAGE_URLS.length);

    await showImagePair(currentImageIndex, nextImageIndex);
    applyCurrentTransition();
    transitions.playOnce();

    currentImageIndex = nextImageIndex;
    currentTransitionIndex = modulo(
      currentTransitionIndex + 1,
      availableTransitionNames.length
    );

    carouselTimeoutId = window.setTimeout(() => {
      advanceCarousel().catch((err) => {
        console.error(err);
      });
    }, transitions.runtimeState.duration + TRANSITION_DELAY);
  }

  function stopCarousel() {
    isCarouselRunning = false;

    if (carouselTimeoutId !== null) {
      window.clearTimeout(carouselTimeoutId);
      carouselTimeoutId = null;
    }
  }

  function startCarousel() {
    stopCarousel();
    isCarouselRunning = true;
    advanceCarousel().catch((err) => {
      console.error(err);
    });
  }

  // Initial state: show the first image transitioning to the second.
  await showImagePair(0, IMAGE_URLS.length > 1 ? 1 : 0);
  applyCurrentTransition();

  transitions.mountButtons(controls);
  transitions.start();
  transitions.playOnce();

  durationInput.value = String(TRANSITION_DURATION);

  durationInput.addEventListener('change', () => {
    transitions.setDuration(durationInput.value);
    startCarousel();
  });

  durationInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      transitions.setDuration(durationInput.value);
      startCarousel();
    }
  });

  playButton.addEventListener('click', () => {
    transitions.setDuration(durationInput.value);
    startCarousel();
  });

  window.addEventListener('beforeunload', () => {
    stopCarousel();
    transitions.stop();
  });

  // Start the automated carousel loop after the initial transition.
  carouselTimeoutId = window.setTimeout(() => {
    advanceCarousel().catch((err) => {
      console.error(err);
    });
  }, transitions.runtimeState.duration + TRANSITION_DELAY);

  window.transitions = transitions;

  window.startCarousel = startCarousel;
  window.stopCarousel = stopCarousel;

  // Optional convenience helpers
  window.setAngularSpeed = (value) => {
    transitions.setTransitionParams('angular', {
      speed: Number(value)
    });
  };

  window.setCrossZoomIntensity = (value) => {
    transitions.setTransitionParams('cross-zoom', {
      intensity: Number(value)
    });
  };

  window.setDirection = (x, y) => {
    transitions.setTransitionParams('slide-wrap', {
      direction: [Number(x), Number(y)]
    });
  };

  window.setStripeCount = (value) => {
    transitions.setTransitionParams('vertical-stripes', {
      count: Number(value)
    });
  };

  window.setStripeSmoothness = (value) => {
    transitions.setTransitionParams('vertical-stripes', {
      smoothness: Number(value)
    });
  };

  window.setGridSize = (x, y) => {
    transitions.setTransitionParams('random-squares', {
      size: [Number(x), Number(y)]
    });
  };

  window.setDots = (value) => {
    transitions.setTransitionParams('dot-reveal', {
      dots: Number(value)
    });
  };

  window.setCenter = (x, y) => {
    transitions.setTransitionParams('dot-reveal', {
      center: [Number(x), Number(y)]
    });
  };

  window.setDoorway = (partial) => {
    transitions.setTransitionParams('doorway', partial);
  };

  window.setHexSteps = (value) => {
    transitions.setTransitionParams('hexagonalize', {
      steps: Number(value)
    });
  };

  window.setHorizontalHexagons = (value) => {
    transitions.setTransitionParams('hexagonalize', {
      horizontalHexagons: Number(value)
    });
  };

  window.setPageCurl = (partial) => {
    transitions.setTransitionParams('page-curl', partial);
  };

  window.setRadialStartingAngle = (value) => {
    transitions.setTransitionParams('radial', {
      startingAngle: Number(value)
    });
  };

  window.setSwap = (partial) => {
    transitions.setTransitionParams('swap', partial);
  };

  window.setSquaresWire = (partial) => {
    transitions.setTransitionParams('squares-wire', partial);
  };
}

main().catch((err) => {
  console.error(err);
  document.body.innerHTML =
    '<pre style="color:white;padding:16px;">' + err.message + '</pre>';
});