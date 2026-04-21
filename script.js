const logoTrack = document.querySelector(".logo-track");
const contactModal = document.querySelector("#contact-modal");
const openContactButton = document.querySelector("[data-open-contact]");
const closeContactButtons = document.querySelectorAll("[data-close-contact]");

if (logoTrack) {
  let offset = 0;
  let frameId = 0;
  let speed = 0.45;

  const getLoopWidth = () => {
    const firstGroup = logoTrack.querySelector(".logo-group");
    return firstGroup ? firstGroup.offsetWidth : 0;
  };

  const animate = () => {
    const loopWidth = getLoopWidth();
    if (!loopWidth) {
      frameId = requestAnimationFrame(animate);
      return;
    }

    offset -= speed;

    if (Math.abs(offset) >= loopWidth) {
      offset = 0;
    }

    logoTrack.style.transform = `translateX(${offset}px)`;
    frameId = requestAnimationFrame(animate);
  };

  const start = () => {
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(animate);
  };

  window.addEventListener("resize", start);

  logoTrack.addEventListener("mouseenter", () => {
    speed = 0.2;
  });

  logoTrack.addEventListener("mouseleave", () => {
    speed = 0.45;
  });

  start();
}

if (contactModal && openContactButton) {
  const toggleModal = (shouldOpen) => {
    contactModal.classList.toggle("is-open", shouldOpen);
    contactModal.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
    document.body.style.overflow = shouldOpen ? "hidden" : "";
  };

  openContactButton.addEventListener("click", () => {
    toggleModal(true);
  });

  closeContactButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleModal(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleModal(false);
    }
  });
}