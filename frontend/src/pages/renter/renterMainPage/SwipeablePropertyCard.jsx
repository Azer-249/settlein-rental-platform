import {
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
} from "motion/react";

import PropertyCard from "./propertyCard/PropertyCard";

function SwipeablePropertyCard({
  property,
  isFront,
  stackIndex,
  onReject,
  onInterested,
  onInfoClick,
  isActionLoading,
}) {
  const x = useMotionValue(0);
  const dragControls = useDragControls();

  const rotateRaw = useTransform(x, [-180, 180], [-16, 16]);
  const opacity = useTransform(x, [-220, 0, 220], [0.35, 1, 0.35]);

  const baseRotate = stackIndex % 2 ? 5 : -5;

  const rotate = useTransform(() => {
    if (isFront) {
      return `${rotateRaw.get()}deg`;
    }

    return `${baseRotate}deg`;
  });

  function handleDragEnd() {
    if (!isFront || isActionLoading) return;

    const swipeDistance = x.get();

    if (swipeDistance > 120) {
      onInterested();
    } else if (swipeDistance < -120) {
      onReject();
    }
  }

  function isInteractiveTarget(target) {
    return Boolean(
      target.closest(
        "button, a, input, textarea, select, label, [data-no-card-drag]",
      ),
    );
  }

  function handlePointerDown(event) {
    if (
      isFront &&
      !isActionLoading &&
      !isInteractiveTarget(event.target)
    ) {
      dragControls.start(event, { distanceThreshold: 8 });
    }
  }

  return (
    <motion.div
      className="renter-swipe-card"
      draggable={false}
      onPointerDownCapture={handlePointerDown}
      style={{
        x,
        rotate,
        opacity: isFront ? opacity : 1,
        zIndex: 10 - stackIndex,
        pointerEvents: isFront ? "auto" : "none",
      }}
      animate={{
        scale: isFront ? 1 : 1 - stackIndex * 0.035,
        y: stackIndex * 14,
      }}
      drag={isFront ? "x" : false}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
    >
      <PropertyCard property={property} onInfoClick={onInfoClick} />
    </motion.div>
  );
}

export default SwipeablePropertyCard;
