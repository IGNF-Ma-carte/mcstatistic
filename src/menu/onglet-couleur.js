import charte from "mcutils/charte/macarte";
import 'mcutils/font/loadFonts';
import PopupSymbol from 'mcutils/input/PopupSymbol';
import ColorInput from 'ol-ext/util/input/Color';
import Slider from 'ol-ext/util/input/Slider';

import layer, { brewer, calcStatistique } from "../map/layer";

import content from '../pages/couleur-page.html';
import '../pages/couleur.scss';

const tab = charte.addMenuTab('couleur', 'fi-visible', 'Visuel', content);
let strokeColor = '#3399CC';

// charte.on('tab:show',(e) => {
//     // console.log(e.id+ ' tab is open...');
// })

tab.querySelector('[data-stat="brewerColors"] div').appendChild(brewer.element);

// Rayon des symboles
const rsymb = tab.querySelector('input[data-stat="rsymb"]')
rsymb.addEventListener('change', (e) => {
    if (parseFloat(e.target.value) < 1) e.target.value = 1;
    calcStatistique({ rsymb: parseFloat(e.target.value) });
});

// rayon des points
const rmin = tab.querySelector('input[data-stat="rmin"]')
rmin.addEventListener('change', (e) => {
    if (parseFloat(e.target.value) < 1) e.target.value = 1;
    if (parseFloat(e.target.value) > parseFloat(rmax.value)) e.target.value = rmax.value;
    calcStatistique({ rmin: parseFloat(e.target.value) });
});
const rmax = tab.querySelector('input[data-stat="rmax"]')
rmax.addEventListener('change', (e) => {
    if (parseFloat(e.target.value) < parseFloat(rmin.value)) e.target.value = rmin.value;
    calcStatistique({ rmax: parseFloat(e.target.value) });
});
tab.querySelector('[data-stat="rayon"] input[type="checkbox"]').addEventListener('change', (e) => {
    if (e.target.checked) {
        rmin.value = -1;
        tab.querySelector('[data-stat="rayon"]').dataset.prop = 1; 
    } else {
        rmin.value = 1;
        delete tab.querySelector('[data-stat="rayon"]').dataset.prop;
    }
    propAttr.disabled = propArea.disabled = !e.target.checked;
    calcStatistique({ rmin: parseFloat(rmin.value) });
});
const propArea = tab.querySelector('[data-stat="rayon"] select');
propArea.addEventListener('change', (e) => {
    calcStatistique({ rProp: e.target.value });
});
propArea.disabled = true;

// Attribut codant la taille du symbol
const propAttr = tab.querySelector('[data-stat="col2"] select')
propAttr.addEventListener('change', e => {
    calcStatistique({ col2: e.target.value })
})
propAttr.disabled = true;

// affichage ou non du contour
tab.querySelector('[data-stat="stroke"]  input[type="checkbox"]').addEventListener('change', (e) => {
    if(e.target.checked){
        calcStatistique({ stroke: strokeColor });
    }else{
        calcStatistique({ stroke: false });
    }
});

// couleur du contour
const strokeColorPicker = new ColorInput({
    input: tab.querySelector('[data-stat="stroke"] input[type="text"]'),
    position: 'fixed',
    color: strokeColor,
    hastab: false,
});
strokeColorPicker.on('color', (e) => {
    strokeColor = 'rgba(' + e.color.join(',') + ')';
    calcStatistique({ stroke: strokeColor });
});

// Blend mode
tab.querySelector('[data-stat="blendMode"]  select').addEventListener('change', (e) => {
    layer.setBlendMode(e.target.value);
})


// hradius
tab.querySelector('input[data-stat="hradius"]').addEventListener('change', (e) => {
    calcStatistique({ stroke: parseFloat(e.target.value) });
});
// hblur
tab.querySelector('input[data-stat="hblur"]').addEventListener('change', (e) => {
    calcStatistique({ stroke: parseFloat(e.target.value) });
});


// symboles
const popupSymbol = new PopupSymbol({
    input: tab.querySelector('[data-stat="symbol"] input'),
    symbol: 'ign-form-rond',
});
popupSymbol.on('select', (e) => {
    calcStatistique({ symbol: e.value });
})

// Opacité
let alpha = new Slider({
    min: 0,
    max: 100,
    input: tab.querySelector('[data-stat="alpha"] input'),
});
alpha.on('change:value', function(e) {
    calcStatistique({ alpha: e.value / 100 });
});


// type de graphique
tab.querySelector('[data-stat="chartType"] select').addEventListener('change', (e) => {
    calcStatistique({ chartType: e.target.value });
});

