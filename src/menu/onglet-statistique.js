import charte from "mcutils/charte/macarte";
import Statistic from 'mcutils/layer/Statistic';
import element from 'ol-ext/util/element';

import { calcStatistique } from "../map/layer";

import content from '../pages/statistique-page.html';
import '../pages/statistique.scss';

const tab = charte.addMenuTab('statistic', 'fi-list', 'Statistique', content);

// charte.on('tab:show',(e) => {
//     
// })

const typeMapTrad = Statistic.typeString;

// type de statistique
const typeElt = tab.querySelector('[data-stat="typeMap"]');
document.body.dataset.statistic = 'choroplethe';
Statistic.type.forEach( typeMap => {
    const div = element.create('DIV', {
        parent: typeElt,
        className: typeMap == 'choroplethe' ? 'selected' : '',
        click: (e) => {
            document.body.dataset.statistic = typeMap;
            calcStatistique({ typeMap:  typeMap });
            typeElt.querySelectorAll('.selected').forEach(elt => {
                elt.classList.remove('selected');
            });
            e.target.parentNode.classList.add('selected');
            displayStatOptions(typeMap);
        },
    });
    element.create('IMG', {
        src: './img/type/' + typeMap + '.png',
        parent: div,
    });
    element.create('SPAN', {
        text: typeMapTrad[typeMap],
        parent: div,
    });
})

// colonne(s) à représenter
const colsElt = tab.querySelector('[data-stat="cols"]');
colsElt.addEventListener('change', () => {
    const cols = [];
    colsElt.querySelectorAll('option').forEach(o => {
        if (o.selected) {
            cols.push(o.value);
        }
    })
    calcStatistique({ 'cols' : cols });
});


function displayStatOptions(typeMap){
    const tabDonnees = charte.getMenuTabElement('donnees');
    const tabRepresentation = charte.getMenuTabElement('representation');
    
    //liste des DOM-elements permettant de parametrer la couche statistique
    const elts = {
        cols: tab.querySelector('[data-stat="cols"]'),
        mode: tabDonnees.querySelector('[data-stat="mode"]'),
        nbClass: tabDonnees.querySelector('[data-stat="nbClass"]'),
        col2: tabRepresentation.querySelector('[data-stat="col2"]'),
        symbol: tabRepresentation.querySelector('[data-stat="symbol"]'),
        rmin: tabRepresentation.querySelector('[data-stat="rayon"]'),
        rmax: null, 
        stroke: tabRepresentation.querySelector('[data-stat="stroke"]'),
        limits: tabDonnees.querySelector('[data-stat="limits"]'),
        alpha: tabRepresentation.querySelector('[data-stat="alpha"]'),
        chartType: tabRepresentation.querySelector('[data-stat="chartType"]'),
        hradius: tabRepresentation.querySelector('[data-stat="hradius"]'), 
        hblur: null,
        brewerColors: tabRepresentation.querySelector('[data-stat="brewerColors"]'),
    };
    const params = Statistic.paramList;

    // on affiche/masque ou adapte les différents parametrages de représentation en fonction du type de statistique (typeMap)
    Object.keys(params).forEach( key => {
        let elt = elts[key];
        if(!elt){
            return;
        }
        if(key == 'cols'){
            if(typeMap == 'sectoriel'){
                elts[key].setAttribute('multiple', 'multiple');
            }else{
                elts[key].removeAttribute('multiple');
            }
            return;
        }
        if(params[key].includes(typeMap)){
            elt.classList.remove('hide');
        }else{
            elt.classList.add('hide');
        }

    })
}

export { displayStatOptions };