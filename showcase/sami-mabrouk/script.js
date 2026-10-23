import gsap from "gsap";

const totalImageCount = 12;

const galleryConfig = {
  ovalWidthRatio: 0.28,
  ovalHeightRatio: 0.26,
  tiltAngle: -20,
  idleRotationSpeed: 0.035,
  scrollAcceleration: 0.0055,
  maxRotationSpeed: 2.5,
  speedEasing: 0.05,
  hoverScale: 1.1,
  idleImageZoom: 1.1,
  dimmedBrightness: 0.35,
  hoverDuration: 1,
  hoverEase: "expo.out",
};

const gallery = document.querySelector(".gallery");
const galleryItems = [];

let ovalRadiusX = 0;
let ovalRadiusY = 0;
let tiltCos = 0;
let tiltSin = 0;

let ringRotation = 0;
let rotationDirection = 1;
let rotationSpeed = galleryConfig.idleRotationSpeed;

let pointerX = -1;
let pointerY = -1;
let hoveredItem = null;

for (let index = 0; index < totalImageCount; index++) {
  const wrapper = document.createElement("div");
  wrapper.className = "item";

  const frame = document.createElement("div");
  frame.className = "img";

  const image = document.createElement("img");
  image.src = `${import.meta.env.BASE_URL}img${index + 1}.jpg`;

  frame.appendChild(image);
  wrapper.appendChild(frame);
  gallery.appendChild(wrapper);

  gsap.set(frame, { scale: 1 });
  gsap.set(image, { scale: galleryConfig.idleImageZoom });
  gsap.set(wrapper, { filter: "saturate(1) brightness(1)" });

  const ringAngle = (index / totalImageCount) * Math.PI * 2;
  galleryItems.push({ wrapper, frame, image, ringAngle });
}

function measureGallery() {
  ovalRadiusX = window.innerWidth * galleryConfig.ovalWidthRatio;
  ovalRadiusY = window.innerHeight * galleryConfig.ovalHeightRatio;

  const tiltRadians = (galleryConfig.tiltAngle * Math.PI) / 180;
  tiltCos = Math.cos(tiltRadians);
  tiltSin = Math.sin(tiltRadians);
}

function positionItem(item, rotationRadians) {
  const angle = item.ringAngle + rotationRadians;
  const ovalX = Math.cos(angle) * ovalRadiusX;
  const ovalY = Math.sin(angle) * ovalRadiusY;

  const tiltedX = ovalX * tiltCos - ovalY * tiltSin;
  const tiltedY = ovalX * tiltSin + ovalY * tiltCos;

  item.wrapper.style.transform = `translate(${tiltedX}px, ${tiltedY}px)`;
}

measureGallery();
galleryItems.forEach((item) => positionItem(item, 0));

window.addEventListener("wheel", (event) => {
  rotationDirection = event.deltaY > 0 ? 1 : -1;
  rotationSpeed += Math.abs(event.deltaY) * galleryConfig.scrollAcceleration;
  rotationSpeed = Math.min(rotationSpeed, galleryConfig.maxRotationSpeed);
});

function animateGallery() {
  rotationSpeed +=
    (galleryConfig.idleRotationSpeed - rotationSpeed) *
    galleryConfig.speedEasing;
  ringRotation += rotationSpeed * rotationDirection;
  const rotationRadians = (ringRotation * Math.PI) / 180;

  const itemUnderCursor = getHoveredItem();
  if (itemUnderCursor !== hoveredItem) {
    applyHoverState(itemUnderCursor);
    hoveredItem = itemUnderCursor;
  }

  galleryItems.forEach((item) => positionItem(item, rotationRadians));
  requestAnimationFrame(animateGallery);
}

animateGallery();

window.addEventListener("mousemove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
});
window.addEventListener("mouseleave", () => {
  pointerX = -1;
  pointerY = -1;
});

function getHoveredItem() {
  if (pointerX < 0) return null;
  const target = document.elementFromPoint(pointerX, pointerY);
  const hoveredItem = target ? target.closest(".item") : null;
  return hoveredItem
    ? galleryItems.find((item) => item.wrapper === hoveredItem) || null
    : null;
}

function applyHoverState(activeItem) {
  galleryItems.forEach((item) => {
    const isActive = item === activeItem;
    const isDimmed = activeItem && !isActive;

    gsap.to(item.frame, {
      scale: isActive ? galleryConfig.hoverScale : 1,
      duration: galleryConfig.hoverDuration,
      ease: galleryConfig.hoverEase,
      overwrite: true,
    });

    gsap.to(item.image, {
      scale: isActive ? 1 : galleryConfig.idleImageZoom,
      duration: galleryConfig.hoverDuration,
      ease: galleryConfig.hoverEase,
      overwrite: true,
    });

    gsap.to(item.wrapper, {
      filter: `saturate(${isDimmed ? 0 : 1}) brightness(${
        isDimmed ? galleryConfig.dimmedBrightness : 1
      })`,
      duration: galleryConfig.hoverDuration,
      ease: galleryConfig.hoverEase,
      overwrite: true,
    });
  });
}

window.addEventListener("resize", measureGallery);
