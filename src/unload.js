// empeche de changer de page ou de la fermer si une modification a été apportée sans être enregistrée

import _T from 'mcutils/i18n/i18n'
import carte from "./map/carte";
import slayer from './map/layer'

// Prevent unload
let dirty = false;
window.onbeforeunload = function() {
  // is map dirty
  return dirty ? _T('hasChanged') : null;
}

/**
 * Returns true if any modifcations occurs on the map.
 * @param {*} b 
 * @returns 
 */
function setDirty(b) {
  if (b === dirty) return;
  if (b) {
    dirty = true;
    if (!/ ⬤$/.test(document.title)) document.title = document.title + ' ⬤';
  } else {
    setTimeout(() => { 
      dirty = false;
      document.title = document.title.replace(/ ⬤$/, '');
    }, 500)
  }
}

/* Handle map modifications */
carte.on('change', () => setDirty(slayer.getStatistic().cols.length));
carte.getMap().getLayerGroup().on('change', () => setDirty(slayer.getStatistic().cols.length));
carte.on(['read', 'save'], () => setDirty(false));

carte.isDirty = function() { return dirty }

export default dirty;
