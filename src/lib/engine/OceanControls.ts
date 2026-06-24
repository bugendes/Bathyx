/**
 * Bathyx — Ocean Floor Camera Controls
 * Planetarium-style camera for exploring the ocean floor
 */
import * as THREE from 'three';

export class OceanCamera {
  camera: THREE.PerspectiveCamera;
  private azimuth: number = 0;
  private altitude: number = 0;
  private distance: number = 700;
  private target: THREE.Vector3;
  private minDistance: number = 510;
  private maxDistance: number = 2000;
  private minAltitude: number = -89;
  private maxAltitude: number = 89;

  // Drag state
  private isDragging: boolean = false;
  private lastPointer: { x: number; y: number } = { x: 0, y: 0 };
  private rotateSpeed: number = 0.3;
  private zoomSpeed: number = 1.0;

  // Touch state
  private lastPinchDist: number = 0;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 10000);
    this.target = new THREE.Vector3(0, 0, 0);
    this.updatePosition();

    // Bind event handlers
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  }

  attach(element: HTMLElement) {
    element.addEventListener('pointerdown', this.onPointerDown);
    element.addEventListener('pointermove', this.onPointerMove);
    element.addEventListener('pointerup', this.onPointerUp);
    element.addEventListener('pointerleave', this.onPointerUp);
    element.addEventListener('wheel', this.onWheel, { passive: false });
    element.addEventListener('touchstart', this.onTouchStart, { passive: false });
    element.addEventListener('touchmove', this.onTouchMove, { passive: false });
    element.addEventListener('touchend', this.onTouchEnd);
  }

  detach(element: HTMLElement) {
    element.removeEventListener('pointerdown', this.onPointerDown);
    element.removeEventListener('pointermove', this.onPointerMove);
    element.removeEventListener('pointerup', this.onPointerUp);
    element.removeEventListener('pointerleave', this.onPointerUp);
    element.removeEventListener('wheel', this.onWheel);
    element.removeEventListener('touchstart', this.onTouchStart);
    element.removeEventListener('touchmove', this.onTouchMove);
    element.removeEventListener('touchend', this.onTouchEnd);
  }

  updateAspect(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  private updatePosition() {
    const phi = ((90 - this.altitude) * Math.PI) / 180;
    const theta = (this.azimuth * Math.PI) / 180;

    this.camera.position.set(
      this.target.x + this.distance * Math.sin(phi) * Math.cos(theta),
      this.target.y + this.distance * Math.cos(phi),
      this.target.z + this.distance * Math.sin(phi) * Math.sin(theta)
    );

    this.camera.lookAt(this.target);
  }

  private onPointerDown(e: PointerEvent) {
    this.isDragging = true;
    this.lastPointer = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement)?.setPointerCapture(e.pointerId);
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isDragging) return;

    const dx = e.clientX - this.lastPointer.x;
    const dy = e.clientY - this.lastPointer.y;

    this.azimuth -= dx * this.rotateSpeed;
    this.altitude = Math.max(
      this.minAltitude,
      Math.min(this.maxAltitude, this.altitude + dy * this.rotateSpeed)
    );

    this.lastPointer = { x: e.clientX, y: e.clientY };
    this.updatePosition();
  }

  private onPointerUp(_e: PointerEvent) {
    this.isDragging = false;
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.9;
    this.distance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.distance * delta)
    );
    this.updatePosition();
  }

  private onTouchStart(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      this.lastPinchDist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
    }
  }

  private onTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length === 1 && this.isDragging) {
      const dx = e.touches[0].clientX - this.lastPointer.x;
      const dy = e.touches[0].clientY - this.lastPointer.y;

      this.azimuth -= dx * this.rotateSpeed;
      this.altitude = Math.max(
        this.minAltitude,
        Math.min(this.maxAltitude, this.altitude + dy * this.rotateSpeed)
      );

      this.lastPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this.updatePosition();
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      const scale = this.lastPinchDist / dist;
      this.distance = Math.max(
        this.minDistance,
        Math.min(this.maxDistance, this.distance * scale)
      );
      this.lastPinchDist = dist;
      this.updatePosition();
    }
  }

  private onTouchEnd(_e: TouchEvent) {
    this.isDragging = false;
  }

  /**
   * Smoothly fly to a specific lon/lat/depth
   */
  flyTo(lon: number, lat: number, depth: number, duration: number = 2000) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = lon * (Math.PI / 180);
    const r = 500 + depth * 0.02;

    const targetPos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );

    const startAz = this.azimuth;
    const startAlt = this.altitude;
    const startDist = this.distance;
    const startTime = performance.now();

    const targetAz = lon;
    const targetAlt = lat;
    const targetDistance = Math.max(this.minDistance, r * 1.5);

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease in-out

      this.azimuth = startAz + (targetAz - startAz) * ease;
      this.altitude = startAlt + (targetAlt - startAlt) * ease;
      this.distance = startDist + (targetDistance - startDist) * ease;

      this.updatePosition();

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Auto-rotate (for idle animation)
   */
  autoRotate(speed: number = 0.05) {
    this.azimuth += speed;
    this.updatePosition();
  }

  getAzimuth(): number { return this.azimuth; }
  getAltitude(): number { return this.altitude; }
  getDistance(): number { return this.distance; }
}
