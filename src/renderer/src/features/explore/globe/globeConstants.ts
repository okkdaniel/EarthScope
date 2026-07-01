/** Shared constants for the globe scene, so radii, camera and layers stay consistent. */
export const GLOBE_RADIUS = 1
export const ATMOSPHERE_RADIUS = GLOBE_RADIUS * 1.06

export const CAMERA_MIN_DISTANCE = 1.35
export const CAMERA_MAX_DISTANCE = 4.5
export const DEFAULT_CAMERA_DISTANCE = 2.8

/** Camera distance the view eases to when focusing a single event. */
export const FOCUS_CAMERA_DISTANCE = 1.9

/** Duration of a programmatic camera fly-to, in seconds. */
export const FLY_DURATION_S = 0.9

/** Idle auto-rotation resumes only after this many ms without user interaction. */
export const IDLE_RESUME_MS = 20_000

/**
 * Idle rotation is suppressed while the user is zoomed in past this fraction of
 * the default distance, so the globe never drifts while inspecting an event.
 */
export const IDLE_ZOOM_GATE = 0.9

/** Screen-space radius (px) within which same-category markers cluster. */
export const CLUSTER_THRESHOLD_PX = 34

/** Marker radius offset above the globe surface. */
export const MARKER_RADIUS = GLOBE_RADIUS * 1.012
