// Import Curtainjs
import { Curtains,Plane,Vec2,PingPongPlane } from "https://cdn.jsdelivr.net/npm/curtainsjs@7.2.0/src/index.mjs";
// import { Curtains,Plane,Vec2,PingPongPlane } from "https://cdn.jsdelivr.net/npm/curtainsjs@8.1.4/+esm";

window.addEventListener("load", () => {
  // Set up our WebGL context and append teh canvas to our wrapper
  const curtains = new Curtains({
    container:"canvas",
    pixelRatio: Math.min(1.5, window.devicePixelRatio)
  })

  // Mouse/touch move
  const ww = window.innerWidth
  const wh = window.innerHeight

  const mouse = new Vec2(ww/5,wh/8)
  const lastMouse = mouse.clone()
  const velocity = new Vec2()

  function onMouseMove(e) {
    lastMouse.copy(mouse)

    // touch event
    if (e.targetTouches) {
      mouse.set(e.targetTouches[0].clientX,  e.targetTouches[0].clientY)
    } else {
      mouse.set(e.clientX, e.clientY)
    }

    velocity.set((mouse.x - lastMouse.x) / 16, (mouse.y - lastMouse.y) / 16)

    // update the velocity
    updateVelocity = true;
  }

  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("touchmove", onMouseMove, {
    passive: true,
  })

  // Create planeElement
  const planeElement = document.getElementById("flowmap")

  const flowMapParams = {
    sampler: "uFlowMap",
    vertexShader: flowmapVs,
    fragmentShader: flowmapFs,
    texturesOptions: {
      floatingPoint: "half-float",
    },
    uniforms: {
      mousePosition: {
        name: "uMousePosition",
        type: "2f",
        value: mouse
      },
      fallOff: {
        name: "uFalloff",
        type: "1f",
        value: ww > wh ? ww / 10000 : wh / 10000
      },
      cursorGrow: {
        name: "uCursorGrow",
        type: "1f",
        value: 1.15
      },
      alpha: {
        name: "uAlpha",
        type: "1f",
        value: 1.14
      },
      dissipation: {
        name: "uDissipation",
        type: "1f",
        value: 0.925
      },
      velocity: {
        name: "uVelocity",
        type: "2f",
        value: velocity
      },
      aspect: {
        name: "uAspect",
        type: "1f",
        value: ww / wh
      }
    }
  }

  // Create ping pong plane
  const flowMap = new PingPongPlane(curtains,planeElement,flowMapParams)

  flowMap.onRender(() => {
    // update mouse position
    flowMap.uniforms.mousePosition.value = flowMap.mouseToPlaneCoords(mouse)
    
    flowMap.uniforms.velocity.value = new Vec2(
      curtains.lerp(velocity.x, 0.5, 1.5),
      curtains.lerp(velocity.y, 0.5, 1.5)
    )
  })

  // Add displacements shader
  const params = {
    vertexShader: displacementVs,
    fragmentShader: displacementFs
  }

  // Create plane
  const plane = new Plane(curtains,planeElement,params)

  // Create a texture that will hold our flowmap
  const flowTexture = plane.createTexture({
    sampler: "uFlowTexture",
    fromTexture: flowMap.getTexture()
  })
})
