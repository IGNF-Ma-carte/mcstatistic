import charte from "mcutils/charte/macarte";
import 'mcutils/font/loadFonts';
import PopupSymbol from 'mcutils/input/PopupSymbol';
import ColorInput from 'ol-ext/util/input/Color';
import Slider from 'ol-ext/util/input/Slider';

import content from '../pages/couleur.html';
import '../pages/couleur.scss';
import layer, { brewer, calcStatistique } from "../map/layer";

const tab = charte.addMenuTab('couleur', 'fi-visible', 'Visuel', content);
let strokeColor = '#3399CC';

// charte.on('tab:show',(e) => {
//     // console.log(e.id+ ' tab is open...');
// })

tab.querySelector('[data-stat="brewerColors"] div').appendChild(brewer.element);
  
// rayon des points
const rmin = tab.querySelector('input[data-stat="rmin"]')
rmin.addEventListener('change', (e) => {
    if (e.target.value < 1) e.target.value = 1;
    if (e.target.value > rmax) e.target.value = rmax;
    calcStatistique({ rmin: parseFloat(e.target.value) });
});
const rmax = tab.querySelector('input[data-stat="rmax"]')
rmax.addEventListener('change', (e) => {
    if (e.target.value < rmin.value) e.target.value = rmin.value;
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
    calcStatistique({ rmin: parseFloat(rmin.value) });
});

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

