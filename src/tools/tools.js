import charte from "mcutils/charte/macarte";

// Print button
charte.addTool('print','fi-print','Imprimer', () => {
  carte.getControl('printDlg').print()
})

