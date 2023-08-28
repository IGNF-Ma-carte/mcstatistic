import charte from "mcutils/charte/macarte";
import 'mcutils/font/loadFonts';
import Statistic from 'mcutils/layer/Statistic';
import element from 'ol-ext/util/element';

import content from '../pages/donnees.html';
import '../pages/donnees.scss';
import layer, { brewer, calcStatistique, graph } from "../map/layer";

const tab = charte.addMenuTab('donnees', 'fi-table', 'Classes', content);
tab.querySelector('[data-stat="limits"] div').appendChild(graph.element);

// Repartition mode
const modeElt = tab.querySelector('[data-stat="mode"] select');
const modes = Statistic.mode;
Object.keys(modes).forEach( key => {
    element.create('OPTION', {
        value: key,
        text: modes[key],
        parent: modeElt,
    });
});
modeElt.addEventListener('change', () => {
    calcStatistique({ mode: modeElt.value });
    inputClass.disabled = (modeElt.value === 'c');
    tab.dataset.mode = modeElt.value;
})

// Add / remove on custom
tab.querySelector('[data-stat="nbClass"] button.addFirst').addEventListener('click', () => {
    const stat = layer.getStatistic()
    if (stat.mode !== 'c') return;
    stat.nbClass++;
    inputClass.value = stat.nbClass;
    // Add new value
    stat.limits.splice(1, 0, (stat.limits[0] + stat.limits[1]) / 2);
    // Calculate
    calcStatistique(stat);
})
tab.querySelector('[data-stat="nbClass"] button.removeFirst').addEventListener('click', () => {
    const stat = layer.getStatistic()
    if (stat.mode !== 'c') return;
    if (stat.nbClass > 1) {
        stat.nbClass--;
        inputClass.value = stat.nbClass;
        // Add new value
        stat.limits.splice(1, 1);
        // Calculate
        calcStatistique(stat);
    }
})
tab.querySelector('[data-stat="nbClass"] button.addLast').addEventListener('click', () => {
    const stat = layer.getStatistic()
    if (stat.mode !== 'c') return;
    stat.nbClass++;
    inputClass.value = stat.nbClass;
    // Add new value
    const nb = stat.limits.length - 1;
    stat.limits.splice(nb, 0, (stat.limits[nb-1] + stat.limits[nb]) / 2);
    // Calculate
    calcStatistique(stat);
})
tab.querySelector('[data-stat="nbClass"] button.removeLast').addEventListener('click', () => {
    const stat = layer.getStatistic()
    if (stat.mode !== 'c') return;
    if (stat.nbClass > 1) {
        stat.nbClass--;
        inputClass.value = stat.nbClass;
        // Add new value
        stat.limits.splice(stat.limits.length - 2, 1);
        // Calculate
        calcStatistique(stat);
    }
})

// Nb classes
const inputClass = tab.querySelector('[data-stat="nbClass"] input')
inputClass.addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    brewer.setSize(val);
    calcStatistique({ 
        nbClass: parseInt(val),
        brewer: brewer.getColors(),
    });
})