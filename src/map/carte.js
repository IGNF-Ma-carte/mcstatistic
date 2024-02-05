import Carte from 'mcutils/Carte';
import charte from 'mcutils/charte/macarte';
import PopupFeature from 'ol-ext/overlay/PopupFeature';

import template from './template.carte'
import '../pages/carte.css'

const carte = new Carte({
    target: charte.getAppElement()
});

carte.read(template)

const popup = new PopupFeature({
    canFix: true,
    minibar: true,
    template: function(f) {
        const prop = f.getProperties();
        delete prop.geometry;
        return {
            attributes: prop
        };
    },
    select: carte.getSelect()
});
carte.getMap().addOverlay(popup);

carte.setSelectStyle({ type: 'overlay', points: false });

export { popup };
export default carte;