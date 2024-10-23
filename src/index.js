// import './localhostapi' ;
import './mcversion'
import './i18n';
import charte from  'mcutils/charte/macarte';

import carte from './map/carte'
import slayer from './map/layer'
import './unload'

import './tools/tools'
import './menu/menu'
import './menu/onglet'

charte.setApp('mestat', 'Ma carte', ['owner', 'editor']);

/* DEBUG */
  window.charte = charte;
  window.carte = carte;
  window.slayer = slayer;
/**/