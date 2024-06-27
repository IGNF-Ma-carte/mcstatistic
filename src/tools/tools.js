import charte from "mcutils/charte/macarte";
import carte from '../map/carte'

// Print button
charte.addTool('print','fi-print','Imprimer', () => {
  carte.getControl('printDlg').print()
})

