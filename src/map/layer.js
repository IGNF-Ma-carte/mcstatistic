import Statistic from 'mcutils/layer/Statistic'
import VectorSource from 'ol/source/Vector'
import notification from 'mcutils/dialog/notification';
import dialog from "mcutils/dialog/dialog";
import ColorBrewer from 'mcutils/control/ColorBrewer';
import RepartitionGraph from 'mcutils/control/RepartitionGraph';

import carte from "./carte"


// Add brewer
const brewer = new ColorBrewer({});

brewer.on(['change:scheme', 'check', 'change:color'], () => {
    calcStatistique({ brewerColors: brewer.getColors()}, 300);
})
    
// Add repartition graph
const graph = new RepartitionGraph({});
graph.on('change:limit', (e) => {
    calcStatistique({ limits: e.limits });
});

const layer = new Statistic({
    title: 'Statistique',
    type: 'Statistique',
    source: new VectorSource(),
});
calcStatistique({ brewerColors: brewer.getColors() });

carte.on('read', () => {
    carte.getMap().addLayer(layer);
});
carte.showControl('legend', true);


layer.on('stat:start', () => {
    notification.show('calcul...', -1);
});

layer.on('stat:end', (e) => {
    notification.hide();
    if (e.error) {
      dialog.showAlert('Impossible de calculer la statistique...<br/>' + e.statusText);
      return;
    } 
    // Handle size
    switch (e.stat.typeMap) {
      case 'categorie': {
        brewer.setSize(layer.getValues().length);
        break;
      }
      case 'sectoriel': {
        brewer.setSize(e.stat.cols.length);
        break;
      }
      default: {
        brewer.setSize(e.stat.nbClass);
        break;
      }
    }

    // Show repartition on change
    graph.setRepartition({
      mode: layer.getMode(), 
      values: layer.getValues(),
      limits: layer.getLimits(),
      colors: brewer.getColors()
    });

    // Legend
    const legendCtrl = carte.getControl('legend').getLegend();
    carte.showControl('legend', true);
    legendCtrl.getItems().clear();
    layer.getStatLegend().forEach(item => {
      legendCtrl.addItem(item);
    });
})

function calcStatistique(options) {
    try {
        layer.setStatistic(options, 300);
    } catch(e) {
        if (layer.getStatistic().cols.length === 0) {
            notification('Aucune colonne sélectionnée !!!');
            return;
        }
        console.error(e);
    }
}

/* DEBUG * /
window.layer = layer
/**/

export { brewer, graph, calcStatistique };
export default layer;
