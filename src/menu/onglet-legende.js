import charte from "mcutils/charte/macarte";
import carte from "../map/carte";
import layer from "../map/layer";

import content from '../pages/legende-page.html';
import '../pages/legende.scss';

const tab = charte.addMenuTab('legende', 'fi-legend', 'Légende', content);

charte.on('tab:show',(e) => {
    // console.log(e.id+ ' tab is open...');
})

const legend = carte.getControl('legend').getLegend();

// titre de la légende
const inputTitle = tab.querySelector('[data-legend="title"]');
inputTitle.addEventListener('change', (e) => {
    legend.setTitle(e.target.value);
})
inputTitle.value = legend.getTitle();

// hauteur de la ligne
const inputHeight = tab.querySelector('[data-legend="line"]')
inputHeight.addEventListener('change', (e) => {
    legend.set('lineHeight', parseInt(inputHeight.value));
})
carte.on('read', () => {
    inputHeight.value = legend.get('lineHeight');
})

export default legend;
