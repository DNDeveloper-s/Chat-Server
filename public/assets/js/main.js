import { bgAnim, toggleAuthFormUI } from './utilities';
import { submitRegForm } from './auth';
require('./eventHandlers')();

// import './dashboard/dashboardUI';

// Some utilities function BackgroundAnimation
bgAnim();
// Toggle Auth Forms
toggleAuthFormUI(submitRegForm);

// submitRegHandler();

// addModal();

// addNewNS();

console.log('Nice');