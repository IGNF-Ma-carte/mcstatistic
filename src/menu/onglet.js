import _T from "mcutils/i18n/i18n";
import helpDialog from "mcutils/dialog/helpDialog";

import { displayStatOptions } from './onglet-statistique.js';
import './onglet-donnees.js';
import './onglet-couleur.js';
import './onglet-legende.js';
// import './onglet-parametre.js';

import '../pages/help.css'

/** Add help button on onglets
 */
 document.body.querySelectorAll('[data-help]').forEach((elt) => {
  const help = elt.getAttribute('data-help').split(' ');
  const msg = _T(help[0]);
  helpDialog(elt, msg, { className: help[1] });
});

displayStatOptions('choroplethe');
