import charte from "mcutils/charte/macarte";
import saveCarte from 'mcutils/dialog/saveCarte';
import api from 'mcutils/api/api';
import { connectDialog } from 'mcutils/charte/macarte';
import { transformExtent } from 'ol/proj';
import dialog from "mcutils/dialog/dialog";
import FileSaver from 'file-saver'
import GeoJSON from 'ol/format/GeoJSON';
import ol_ext_element from 'ol-ext/util/element'

import { showNewFile, loadFromFile } from'./load-file.js';
import carte from '../map/carte.js';
import layer from '../map/layer.js';
import serviceURL, { getEditorURL } from "mcutils/api/serviceURL.js";

import '../pages/menu.scss';

import onsaveHTML from '../pages/onsave-page.html'
import '../pages/onsave.css'

const content = `
<label class="ol-ext-check ol-ext-checkbox"><input class="data" type="checkbox" /><span></span> les données (GeoJSON) </label>
<label class="ol-ext-check ol-ext-checkbox" style="display:none"><input class="style" type="checkbox" /><span></span> un fichier de style (SLD) </label>
<label class="ol-ext-check ol-ext-checkbox"><input class="carte" type="checkbox" /><span></span> la carte complète </label>
`;

charte.addTool('save', 'fi-download', 'Télécharger les données', () => {
  if (!isValid(layer)) return;

  dialog.show({
    title: 'Télécharger',
    content: content,
    className: 'export',
    buttons: { submit: 'charger', cancel: 'annuler' },
    onButton: (b, inputs) => {
      if (b==='submit') {
        const error = [];
        const stat = layer.getStatistic();
        ['data','style','carte'].forEach(s => {
          if (inputs[s].checked) {
            let data, name, type = 'text/plain'
            switch (s) {
              case 'data': {
                // Write carte data
                if (stat.typeMap === 'symbol') {
                  const ptLayer = layer.getVectorStyle()
                  data = (new GeoJSON).writeFeatures(ptLayer.getSource().getFeatures(),{
                    featureProjection: carte.getMap().getView().getProjection(),
                    decimals: 7
                  })
                } else {
                  data = (new GeoJSON).writeFeatures(layer.getSource().getFeatures(),{
                    featureProjection: carte.getMap().getView().getProjection(),
                    decimals: 7
                  })
                }
                name = 'statistique.geojson'
                break;
              }
              case 'style': {
                data = layer.getParametricStyle(stat, 'SLD')
                type = 'text/xml'
                name = 'statistique.sld'
                if (typeof(data) !== 'string') {
                  error.push('Impossible de calculer un SLD (' + stat.typeMap + ').')
                }
                break;
              }
              case 'carte': {
                data = carte.write();
                data = JSON.stringify(data, null, ' ');
                name = 'statistique.carte'
                break;
              }
            }
            // Save in a file
            var blob = new Blob([data], {type: type+';charset=utf-8'});
            FileSaver.saveAs(blob, name);
          }
        })
        dialog.close();
        if (error.length) {
          dialog.showAlert(error.join('<\br>'))
        }
      }
    }
  })
})

// Save button
charte.addTool('save', 'fi-save', 'Enregistrer', () => {
  // Check attributes
  if (!isValid(layer)) return;

  // Check if connected then save carte
  api.refreshToken( response => {
    if (response.status) {
      connectDialog( () => { 
        saveCarte(carte, onsave);
      });
    } else {
      saveCarte(carte, onsave);
    }
  });
});

// Load a new file
charte.addTool('newFile', 'fi-new', 'Charger un nouveau fichier', () => {
  if (carte.isDirty()) {
    dialog.showMessage(
      'Une carte est en cours d\'édition. Si vous continuez, les mises à jour ne seront pas enregistrées...',
      { ok: 'Continuer', cancel: 'Abandonner' },
      (b) => {
        if (b==='ok') {
          showNewFile(true);
        }
      }
    )
    return;
  }
  showNewFile(true);
});


// Save map (with metadata)
function onsave(scarte) {
  let metadata = scarte.get('atlas');
  metadata.type = "macarte";
  // Premium EDUGEO
  scarte.set('premium', api.getPremium())
  metadata.premium = api.getPremium();
  metadata.bbox = transformExtent(
    scarte.getMap().getView().calculateExtent(), 
    scarte.getMap().getView().getProjection(), 
    'EPSG:4326'
  );

  // Set title / desc
  scarte.set('title', metadata.title);
  scarte.set('description', metadata.description);

  // Write carte data
  const data = scarte.write();

  // Post the map
  dialog.showWait('Enregistrement en cours...');
  api.postMap(metadata, data, (response) => {
    if (!response.error) {
      console.log('ok')
      /* TODO user XP */
      dialog.show({
        className: 'onsave',
        title: 'Enregistrement',
        content: onsaveHTML
      })
      dialog.getContentElement().querySelector('.macarte').href = getEditorURL(carte.get('atlas'));
      dialog.getContentElement().querySelector('.story').href = serviceURL.narration + '?carte=' + carte.get('atlas').view_id;
      dialog.getContentElement().querySelector('.stats').addEventListener('click', () => dialog.close());
    } else {
      switch (response.status) {
        case 401: {
          connectDialog(() => api.postMap(metadata, data));
          break;
        }
        default: {
          dialog.showAlert('Une erreur s\'est produite.<br/>Impossible d\'enregistrer la carte...<br/>' + response.status)
          break;
        }
      }
    }
  })
}

// Check validity
function isValid(layer) {
  const stat = layer.getStatistic()
  if (stat.cols.length === 0 && stat.typeMap !== 'heatmap') {
    // aucun attribut à afficher n'a été sélectionné
    if(document.body.dataset.menuTab !== 'statistic'){
      charte.showTab('statistic'); 
    }
    dialog.showAlert("Sélectionnez l'attribut sur lequel construire les statistiques");
    return false;
  }
  return true;
}

/* Check url params */
const search = location.search.substr(1).split('&');
if (search.length) {
  const params = {}
  search.forEach(s => {
    const t = s.split('=');
    params[t[0]] = t[1];
  })
  if (params.file) {
    loadFromFile(params.file, params.maille, params.join);
    setTimeout(() => window.history.replaceState({}, document.title, window.location.pathname), 100);
  }
}
