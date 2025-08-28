import charte from 'mcutils/charte/macarte';
import papa from 'papaparse';
import { read, utils } from "xlsx";
import GeoJSON from 'ol/format/GeoJSON';
import GeoJSONX from 'ol-ext/format/GeoJSONX';
import SourceWFS from 'ol-ext/source/TileWFS'
import dialog from 'mcutils/dialog/dialog';
import notification from 'mcutils/dialog/notification';
import element from 'ol-ext/util/element';
import CSVPreview from 'mcutils/control/CSVPreview';
import FileSaver from 'file-saver'
import ol_format_Guesser from 'mcutils/format/Guesser';

import Point from 'ol/geom/Point'
import Feature from 'ol/Feature'

import carte, { popup } from '../map/carte';
import layer, { calcStatistique } from "../map/layer";

import loadFileContent from '../pages/load-file-page.html';
import '../pages/load-file.scss';
import uploadDialog from '../pages/upload-granulary-dialog.html'
import '../pages/upload-granulary.scss';


let papaOptions = {
  skipEmptyLines: true,
  dynamicTyping: true,
  header: true,
};
const errorStr = {
  duplicate: 'dupliqué',
  missing: 'inconnu',
  empty: 'ligne vide'
}
let csvParsed = null;

// Custom granularity file
const customFile = {
  features: [],
  name: '',
  id: ''
}

// File / attribute id match
const fileAttrId = {}

// Init content / preview
const loadFileElt = element.create('DIV', {
  id: 'load-file'
});
document.body.prepend(loadFileElt);
loadFileElt.innerHTML = loadFileContent;

charte.initAccordion(loadFileElt.querySelector('[data-page="params"] .accordion'));

const csvPreview = new CSVPreview({
  nbLines: 5,
  // line: true,
  target: loadFileElt.querySelector('[data-preview]')
});

/* Load a new file
*/
getGeometryChoices();
const fileInput = loadFileElt.querySelector('input[type="file"]');
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) {
    return;
  }

  // LoadFile
  const extension = file.name.split('.').pop().toLowerCase();
  fileInput.value = '';
  loadFileElt.querySelector('[data-param="skipLines"]').value = 0;
  papaOptions.skipLines = 0;

  // Default open maillage
  charte.accordionCheck(loadFileElt.querySelector('li.maillage'), true);

  // Read file
  const reader = new FileReader();
  reader.onload = () => {
    dialog.hide();
    let result = reader.result;
    switch (extension) {
      case 'json':
      case 'geojson': {
        const data = validateJSON(result);
        if (!data) {
          dialog.showAlert("Le fichier n'est pas un fichier JSON valide");
          return;
        }
        loadDataInMap(data);
        if (document.body.dataset.menuTab !== 'statistic') {
          charte.showTab('statistic');
        }
        break;
      }
      case 'ods':
      case 'xls':
      case 'xlsx': {
        const workbook = read(result, { type: 'binary' });
        result = utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
      }
      //@fallthrough
      case 'csv': {
        const nbLines = result.match(/\n/g).length;
        if (nbLines > 15000) {
          loadFileElt.querySelector('[data-page="params"]').dataset.overload = ''
        } else {
          delete loadFileElt.querySelector('[data-page="params"]').dataset.overload
        }
        showFileParams();
        csvPreview.setCSV(result);
        csvParsed = csvPreview.showData(papaOptions);
        displayAttributesForId();
        granularitySelector.dispatchEvent(new Event('change'));
        break;
      }
      default: {
        dialog.showAlert('Type de fichier non pris en compte.' 
          + '<i>' + loadFileElt.querySelector('.upload label i').innerHTML.replace(/\n/g, '<br/>') + '</i>')
        return;
      }
    }
  }

  function readFile() {
    dialog.showWait('Chargement en cours...')
    setTimeout(() => {
      // Start loading
      if (/^xlsx?$|^ods$/.test(extension)) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    }, 200)
  }

  // Check size before read (30 Mo)
  if (file.size / 1024 / 1024 > 30) {
    dialog.showAlert(`
      Attention le fichier sélectionné semble volumineux. 
      <br>
      L'import de fichier volumineux et/ou complexe peut échouer ou provoquer des ralentissements de navigateur. 
      <br/>
      Nous vous recommandons d'utiliser un hébergement externe.
    `, { ok: 'Continuer...', cancel: 'Annuler' }, 
    b => {
      if (b==='ok') {
        readFile()
      }
    })
  } else {
    readFile()
  }

})

// Load a distant file
const urlButton = loadFileElt.querySelector('button[data-action="send-url"]');
const urlInput = loadFileElt.querySelector('input[type="url"]');
urlButton.addEventListener('click', () => {
  const isValid = urlInput.validity.valid;

  if (!isValid) {
    dialog.showAlert("L'url n'est pas valide");
    return;
  }

  const url = urlInput.value;
  urlInput.value = '';
  loadFileElt.querySelector('[data-param="skipLines"]').value = 0;
  papaOptions.skipLines = 0;

  // Default open maillage
  charte.accordionCheck(loadFileElt.querySelector('li.maillage'), true);

  dialog.showWait('Chargement en cours...');
  // Read file
  try {
    fetch(url)
      .then(x => x.text())
      .then(resp => {
        // Create features
        const features = (new ol_format_Guesser()).readFeatures(resp, {
          featureProjection: carte.getMap().getView().getProjection()
        })

        if (!features || !features.length) {
          dialog.showAlert("Le fichier n'est pas un fichier valide<br/><i>(aucune donnée à importer)</i>.");
          return;
        }

        showFeatures(features, url);
        if (document.body.dataset.menuTab !== 'statistic') {
          charte.showTab('statistic');
        }

        notification.show(features.length + ' objet(s) chargé(s)...');
        hideLoadFile();
        dialog.hide();
      }).catch(e => {
        dialog.showAlert('Impossible de charger le fichiere<br/><i>'+ e.message + '</i>')
        console.log([e])
      })
  } catch (e) {
    dialog.hide();
    dialog.showAlert('Une erreur est survenue<br/>'+ e.message);
    return;
  }

})

/*
* charger un exemple
*/
const examples = loadFileElt.querySelector('select[data-example]');
fetch('./data/example/examples.json').then(resp => {
  resp.json().then(example => {
    for (let i in example) {
      element.create('OPTION', {
        value: example[i].file,
        'data-granularity': example[i].granularity,
        html: i,
        parent: examples
      })
    }
  })
})
examples.addEventListener('change', (e) => {
  const value = e.target.value;
  const granularity = e.target.options[e.target.selectedIndex].dataset.granularity;
  loadFileElt.querySelector('select[data-example]').value = '';

  loadFromFile('./data/example/' + value, granularity, 'Code');
})

/** Load a statistique from a file
 * @param {string} fileName the file name to load
 * @param {string} granularity granularity name (Commune, etc)
 * @param {string} code the code to join data-granularity
 */
function loadFromFile(fileName, granularity, code) {
  Promise.all([
    fetch(fileName).then(x => x.text()),
    fetch('./data/geometry/' + granularity + '.geojsonx').then(x => x.text())
  ]).then(([dataText, geojson]) => {
    const data = validateJSON(dataText);
    if (data) {
      loadDataInMap(data);
    } else {
      const result = papa.parse(dataText, papaOptions);
      const join = joinFeatures(geojson, result.data, code);
      showFeatures(join.features);
    }
    if (document.body.dataset.menuTab !== 'statistic') {
      charte.showTab('statistic');
    }
    hideLoadFile();
  });
}

/*
* modifie les options de papaparse avec les inputs de [data-page="params"]
*/
loadFileElt.querySelectorAll('[data-page="params"] input[data-param]').forEach((input) => {
  input.addEventListener('change', () => {
    const param = input.dataset.param;
    switch (param) {
      case 'header':
        papaOptions.header = input.checked;
        break
      case 'skipLines':
        papaOptions.skipLines = parseInt(input.value);
        break;
      case 'comments':
      case 'delimiter':
        papaOptions[param] = input.value;
        break;
    }
    csvParsed = csvPreview.showData(papaOptions, [loadFileElt.querySelector('select[data-param="attr-id"]').value]);
    displayAttributesForId();
  });
});

loadFileElt.querySelector('[data-page="params"] [data-param="attr-id"]').addEventListener('change', () => {
  csvParsed = csvPreview.showData(papaOptions, [loadFileElt.querySelector('select[data-param="attr-id"]').value]);
});

// Activer / desactiver les input text des options de papaparse
loadFileElt.querySelector('[data-page="params"] [data-enable="comments"]').addEventListener('change', () => {
  const input = loadFileElt.querySelector('[data-page="params"] [data-param="comments"]');
  input.toggleAttribute('disabled');
  input.value = '';
  input.dispatchEvent(new Event('change'));
});
loadFileElt.querySelector('[data-page="params"] [data-enable="delimiter"]').addEventListener('change', () => {
  const input = loadFileElt.querySelector('[data-page="params"] [type="text"][data-param="delimiter"]');
  input.toggleAttribute('disabled');
  input.value = '';
  input.dispatchEvent(new Event('change'));
});

/* Granularity selector */
const granularitySelector = loadFileElt.querySelector('select[data-param="granularity"]');

function updateLonlatInput(target) {
  const opt = {};
  const lon = loadFileElt.querySelector('select[data-param="attr-lon"]')
  const lat = loadFileElt.querySelector('select[data-param="attr-lat"]')
  lon.className = '';
  opt[lon.value] = 'longitude';
  lat.className = '';
  opt[lat.value] = 'lattitude';
  if (target && Object.keys(opt).length === 1) {
    target.className = 'invalid';
  }
  csvParsed = csvPreview.showData(papaOptions, opt);
}
loadFileElt.querySelector('select[data-param="attr-lon"]').addEventListener('change', (e) => {
  updateLonlatInput(e.target);
});
loadFileElt.querySelector('select[data-param="attr-lat"]').addEventListener('change', (e) => {
  updateLonlatInput(e.target);
});

// Granularity download
loadFileElt.querySelector('.download').addEventListener('click', () => {
  const granularity = granularitySelector.value.split('/').pop().replace(/\..*$/, '');
  if (granularity !== 'lonlat' && granularity !== 'custom') {
    dialog.showWait('Enregistrement en cours...')
    fetch(granularitySelector.value)
      .then(res => res.json())
      .then(geojson => {
        // Convert to geojson
        const features = (new GeoJSONX).readFeatures(geojson)
        geojson = (new GeoJSON).writeFeatures(features)
        // Save in a file
        const blob = new Blob([geojson], { type: "text/plain;charset=utf-8" });
        FileSaver.saveAs(blob, granularity + '.geojson');
        dialog.close();
      })
  }
})

// Granularity upload
loadFileElt.querySelector('.loadGranularity .upload').addEventListener('click', () => {
  let file;
  dialog.show({
    content: uploadDialog,
    className: 'loadGranularity',
    buttons: { submit: 'ok', cancel: 'annuler' },
    onButton: (b, inputs) => {
      if (b !== 'submit') return;
      dialog.close();
      // Remove last file
      const firstOption = granularitySelector.querySelector('OPTION')
      if (firstOption.value === 'custom') firstOption.remove();
      console.log([firstOption])
      // New custom options
      let name = file.name.split('.')
      if (name.length > 1) name.pop();
      customFile.name = name.join('.').replace(/(^|\s|-|_)([a-z])/g, m => m.toUpperCase())
      granularitySelector.prepend(element.create('OPTION', {
        text: customFile.name,
        value: 'custom'
      }))
      customFile.id = inputs.grid.value;
      granularitySelector.value = 'custom';
      element.dispatchEvent('change', granularitySelector)
    }
  })
  const selectInput = dialog.element.querySelector('select')
  // Drag enter
  element.addListener(dialog.getContentElement().querySelector('input[type="file"]'), ['dragenter', 'dragleave'], e => {
    dialog.getContentElement().dataset.drag = e.type;
  })
  // Change file
  dialog.getContentElement().querySelector('input.grfile').addEventListener('change', e => {
    if (!e.target.files.length) return;
    // Load file
    file = e.target.files[0];
    dialog.getContentElement().dataset.loading = '';
    const reader = new FileReader
    // Read file
    reader.onload = () => {
      const format = new ol_format_Guesser
      customFile.features = format.readFeatures(reader.result, {
        featureProjection: carte.getMap().getView().getProjection()
      });
      const feature = customFile.features[0]
      if (feature) {
        // Get properties
        Object.keys(feature.getProperties()).forEach(p => {
          if (/string|number/.test(typeof (feature.get(p)))) {
            element.create('OPTION', {
              text: p,
              parent: selectInput
            })
          }
        })
      } else {
        customFile.features = [];
      }
      if (customFile.features.length) {
        dialog.getContentElement().dataset.ready = ''
        delete dialog.getContentElement().dataset.error
      } else {
        delete dialog.getContentElement().dataset.ready
        dialog.getContentElement().dataset.error = ''
      }
      delete dialog.getContentElement().dataset.loading;
    }
    dialog.getContentElement().querySelector('span.filename').innerText = file.name;
    delete dialog.getContentElement().dataset.drag;
    reader.readAsText(file)
  })
});

// Handle lonlat
granularitySelector.addEventListener('change', () => {
  if (granularitySelector.value === 'lonlat') {
    loadFileElt.querySelector('.maillage').dataset.lonlat = 1;
    // Search lonlat in attributes
    loadFileElt.querySelectorAll('select[data-param="attr-lon"] option').forEach(o => {
      if (/^lon$|^long$|^longitude$/i.test(o.value)) {
        o.selected = true;
      }
    })
    loadFileElt.querySelectorAll('select[data-param="attr-lat"] option').forEach(o => {
      if (/^lat$|^latitude$/i.test(o.value)) {
        o.selected = true;
      }
    })
    updateLonlatInput();
  } else {
    delete loadFileElt.querySelector('.maillage').dataset.lonlat;
    loadFileElt.querySelector('select[data-param="attr-id"]').dispatchEvent(new Event('change'));
    if (granularitySelector.value === 'custom') {
      loadFileElt.querySelector('.maillage .id span').innerText = customFile.id;
    } else {
      loadFileElt.querySelector('.maillage .id span').innerText = fileAttrId[granularitySelector.value] || '';
    }
  }
})

/*
* Envoyer ou annuler le fichier
*/
loadFileElt.querySelectorAll('[data-page="params"] button').forEach((button) => {
  button.addEventListener('click', () => {
    switch (button.dataset.action) {
      case 'send': {
        if (granularitySelector.value === 'lonlat') {
          const lon = loadFileElt.querySelector('select[data-param="attr-lon"]').value;
          const lat = loadFileElt.querySelector('select[data-param="attr-lat"]').value;
          if (lon === lat) {
            dialog.showAlert('Erreur sur les coordonnées !<br/>Les champs longitude et latitude sont identiques...')
            return;
          }
          const features = [];
          csvParsed.data.forEach(d => {
            const pt = new Point([parseFloat(d[lon]), parseFloat(d[lat])]);
            pt.transform('EPSG:4326', carte.getMap().getView().getProjection());
            // Valid geom ?
            if (!isNaN(pt.getCoordinates()[0]) && !isNaN(pt.getCoordinates()[1])) {
              const feature = new Feature(pt);
              feature.setProperties(d);
              // Add to features
              features.push(feature);
            }
          })
          if (features.length === csvParsed.data.length) {
            notification.show(features.length + ' objets chargés')
          } else {
            dialog.show({
              title: 'Erreur au chargement',
              content: ['<b>',
                features.length,
                '</b> objets chargés sur <b>',
                csvParsed.data.length,
                '</b><br/>(coordonnées inconnues).'
              ].join(' '),
              className: 'alert load',
              buttons: ['ok']
            })
          }
          showFeatures(features);
          hideLoadFile();
          charte.showTab('statistic', true);
        } else {
          // 1-récupérer les données géographiques
          // 2-joindre les datas aux données geographiques
          // 3-afficher les features
          // 4-cacher le chargement de fichier
          const attrId = loadFileElt.querySelector('select[data-param="attr-id"]').value;
          let featureId = 'id'
          dialog.showWait('Recherche des géométries...');
          if (granularitySelector.value === 'custom') {
            featureId = customFile.id
            console.log(customFile.features[0])
            readFeatures(customFile.features)
          } else {
            fetch(granularitySelector.value)
              .then(res => res.json())
              .then(readFeatures)
          }
          function readFeatures(geojson) {
            dialog.hide();
            const join = joinFeatures(geojson, csvParsed.data, attrId, featureId);
            const features = join.features;
            // No error
            if (!join.error.length) {
              notification.show(features.length + ' objets chargés')
            } else {
              let granu = granularitySelector.value.split('/').pop().split('.').shift();
              if (granu === 'custom') granu = customFile.name;
              dialog.show({
                title: 'Erreur au chargement',
                content: ['<b>',
                  features.length,
                  '</b> objets chargés sur <b>',
                  csvParsed.data.length,
                  '</b><br/>',
                  'Certaines lignes du fichier n\'ont pas trouvées de correspondance sur le maillage indiqué...<br/>',
                  'Vérifiez que l\'attribut codant (<i>' + attrId + '</i>)',
                  'correspond bien au maillage choisi',
                  '(<i>' + granu + '</i>)...'
                ].join(' '),
                className: 'alert load',
                buttons: { more: 'plus d\'info...', ok: 'ok' },
                onButton: b => {
                  if (b === 'more') {
                    // Show errors in a dialog
                    const ul = element.create('TABLE')
                    const cols = Object.keys(join.error[0].data);
                    const th = element.create('TR', { parent: ul });
                    element.create('TH', { text: 'erreur', parent: th })
                    cols.forEach(c => {
                      element.create('TH', { text: c, title: c, parent: th })
                    })
                    join.error.forEach(e => {
                      const tr = element.create('TR', { parent: ul });
                      element.create('TD', { text: errorStr[e.error], parent: tr })
                      cols.forEach(c => {
                        element.create('TD', { text: e.data[c] || '', className: typeof (e.data[c]), parent: tr })
                      })
                    })
                    dialog.show({
                      title: granu + ' en erreur',
                      content: ul,
                      className: 'alert loadError',
                      buttons: { ok: 'ok' },
                    })
                  }
                }
              })
            }
            showFeatures(features);
            hideLoadFile();
            charte.showTab('statistic', true);
          };
        }
        // Update stat
        document.querySelector('[data-stat="typeMap"] div img').click()
        break;
      }
      case 'cancel': {
        loadFileElt.querySelector('input[type="file"]').value = '';
        showNewFile();
        break;
      }
    }
  });
});

//fermer le dialogue en cliquant sur la croix
loadFileElt.querySelector('.close').addEventListener('click', () => {
  hideLoadFile();
});

// récupère la liste des géométries administratives disponibles
function getGeometryChoices() {
  let currentFiles = true;
  fetch('./data/geometry/metadata.json?_T=' + (new Date).getTime())
    .then(response => response.json())
    .then(years => {
      const select = granularitySelector;
      select.innerHTML = '';

      // Granulary file
      for (let i in years) {
        const year = years[i];
        let elt = select;
        if (!currentFiles) {
          // on ne met pas les options actuelles dans un groupe
          elt = element.create('OPTGROUP', {
            parent: select,
            label: year.title,
          });
        }

        for (let j in year.files) {
          const file = year.files[j];
          element.create('OPTION', {
            parent: elt,
            text: file.title,
            value: year.path + file.file
          });
          fileAttrId[year.path + file.file] = file.id
        }

        currentFiles = false;
      }

      // LonLat
      element.create('OPTION', {
        parent: select,
        text: 'Géométrie...',
        value: 'lonlat'
      });
    })
}

/* Check json data */
function validateJSON(string) {
  try {
    var data = JSON.parse(string);
    // if came to here, then valid
    return data;
  } catch (e) {
    // failed to parse
    return null;
  }
}

/* Display data attributes menu
*/
function displayAttributesForId() {
  // Get attributes from header
  let header = csvParsed.meta.fields;
  if (!header) {
    header = [];
    for (let i = 0; i < csvParsed.data[0].length; i++) {
      header.push('colonne ' + i)
    }
  }
  // Fill 
  ['id', 'lon', 'lat'].forEach(att => {
    const elt = loadFileElt.querySelector('select[data-param="attr-' + att + '"]');
    elt.innerHTML = '';
    header.forEach(attribute => {
      element.create('OPTION', {
        parent: elt,
        value: attribute,
        text: attribute,
      });
    });
  })
  // Show preview
  csvParsed = csvPreview.showData(papaOptions, [loadFileElt.querySelector('select[data-param="attr-id"]').value]);
}

/** Join data to feature geometry
 * @param {Object} geojson 
 * @param {Array<*>} datas 
 * @param {string} attrId join attribute ID
 * @returns 
 */
function joinFeatures(geojson, datas, attrId, featureId) {
  featureId = featureId || 'id';
  // read features
  const maillage = Array.isArray(geojson) ? geojson : (new GeoJSONX()).readFeatures(geojson, {
    featureProjection: carte.getMap().getView().getProjection()
  });
  const features = []
  const error = []
  const done = {}
  // Join on ID
  datas.forEach(data => {
    let found = false
    const id = data[attrId];
    if (done[id]) {
      error.push({
        id: id,
        data: data,
        error: 'duplicate'
      })
    } else if (id === null || id === '' || id === undefined) {
      // Empty line
      error.push({
        id: id,
        data: data,
        error: 'empty'
      })
    } else {
      for (let i = 0; i < maillage.length; i++) {
        const feature = maillage[i];
        // join on id
        if (id == feature.get(featureId)) {
          // Remove from maillage
          maillage.splice(i, 1);
          done[id] = true;
          // Remove current properties
          Object.keys(feature.getProperties()).forEach(p => {
            if (p !== feature.getGeometryName()) {
              feature.unset(p)
            }
          })
          // Copy data properties
          feature.setProperties(data);
          // Add to features
          features.push(feature);
          found = true;
          break;
        }
      }
      if (!found) {
        error.push({
          id: id,
          data: data,
          error: 'missing'
        })
      }
    }
  });
  return {
    features: features,
    error: error
  }
}

function loadDataInMap(data) {
  try {
    const features = (new GeoJSON()).readFeatures(data, {
      featureProjection: carte.getMap().getView().getProjection(),
    });
    showFeatures(features);
    hideLoadFile();
    notification.show(features.length + ' objet(s) chargé(s)...');
  } catch (e) {
    dialog.showAlert("Une erreur est survenue lors du chargement du fichier");
    console.log('error', e);
  }
}

/** Add feature to the layer and update attribute list 
 * @param {ol_Feature} features
 * @param {string} [url] if features are from a distant file 
 */
function showFeatures(features, url) {
  layer.set('url', url)
  layer.getSource().clear();
  carte.getSelect().getFeatures().clear();
  popup.hide();
  layer.getSource().addFeatures(features);

  //ajouter la liste des attributs dans l'onglet statistique / choisir l'attribut
  const select = charte.getMenuTabElement('statistic').querySelector('select[data-stat="cols"]');
  select.innerHTML = '';
  element.create('OPTION', {
    value: '',
    text: 'Sélectionner un attribut',
    parent: select
  });

  //ajouter la liste des attributs dans l'onglet statistique / choisir l'attribut
  const select2 = charte.getMenuTabElement('couleur').querySelector('[data-stat="col2"] select');
  select2.innerHTML = '';
  element.create('OPTION', {
    value: '',
    text: 'Attribut par défaut',
    parent: select2
  });

  // Fill attributes
  if (features.length) {
    Object.keys(features[0].getProperties()).forEach(property => {
      if (property !== features[0].getGeometryName()) {
        element.create('OPTION', {
          value: property,
          text: property,
          parent: select
        });
        element.create('OPTION', {
          value: property,
          text: property,
          parent: select2
        });
      }
    });
  }

  // Init stats
  calcStatistique({ 'cols': [] })
}

/** Test with WFS layer
 */
function loadWFS() {
  hideLoadFile()
  charte.showTab('statistic', true);

  const tileZoom = 12
  const source = new SourceWFS({
    url: 'https://data.geopf.fr/wfs/ows',
    typeName: 'BDTOPO_V3:commune',
    tileZoom: tileZoom
  })
  layer.setMinZoom(tileZoom - 2)
  layer.setSource(source)

  //ajouter la liste des attributs dans l'onglet statistique / choisir l'attribut
  const select = charte.getMenuTabElement('statistic').querySelector('select[data-stat="cols"]');
  select.innerHTML = '';

  element.create('OPTION', {
    value: '',
    text: 'Sélectionner un attribut',
    parent: select
  });
  calcStatistique({ 'cols': [] })

  function onload() {
    const features = source.getFeatures();
    if (features.length) {
      Object.keys(features[0].getProperties()).forEach(property => {
        if (property !== features[0].getGeometryName()) {
          element.create('OPTION', {
            value: property,
            text: property,
            parent: select
          });
        }
      });
      source.un('tileloadend', onload)
    }
  }
  source.on('tileloadend', onload)
}
window.loadWFS = loadWFS
window.layer = layer

function hideLoadFile() {
  loadFileElt.classList.add('hide');
}
function showNewFile(withClose) {
  loadFileElt.classList.remove('hide');
  loadFileElt.querySelector('[data-page="loading"]').classList.remove('hide');
  loadFileElt.querySelector('[data-page="params"]').classList.add('hide');
  if (withClose) {
    loadFileElt.querySelector('.close').classList.add('visible')
  } else {
    loadFileElt.querySelector('.close').classList.remove('visible')
  }
}
const showFileParams = function () {
  loadFileElt.classList.remove('hide');
  loadFileElt.querySelector('[data-page="loading"]').classList.add('hide');
  loadFileElt.querySelector('[data-page="params"]').classList.remove('hide');
}


/* Display drop zone */
fileInput.addEventListener('dragenter', () => {
  fileInput.parentNode.dataset.over = '';
})
fileInput.addEventListener('dragleave', () => {
  delete fileInput.parentNode.dataset.over;
})
fileInput.addEventListener('drop', () => {
  delete fileInput.parentNode.dataset.over;
})

export { showNewFile, loadFromFile }