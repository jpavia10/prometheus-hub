/* The owner's profile on this device: a first name for the greeting and the home location for the storm watch.
   Both come from him (typed here, the device's own location, or his private seed file). Nothing here ships in the repository. */
export const slice = {
  schema: 1,
  init: () => ({ name: "", place: null, demo: false, seed: null }),      // place: { label, lat, lon }; seed: { label, loaded }
};
export const feed = () => [];
export const search = () => [];
