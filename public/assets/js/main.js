import { bgAnim, toggleAuthFormUI } from './utilities';
import { submitRegForm } from './auth';
// import { submitRegHandler } from './eventHandlers';

// Some utilities function BackgroundAnimation
bgAnim();
// Toggle Auth Forms
toggleAuthFormUI(submitRegForm);

// submitRegHandler();

console.log('Nice');