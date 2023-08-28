/**
 *  Show version log on start
 * 
 */
import ver from '../package.json'
import mcutils from 'mcutils/package.json'

// Display project info
console.log(
  '%cMa carte %cby IGN\n%c' + ver.name + '%c v.' + ver.version + '%c\nlib: ' + mcutils.name + ' - ' + mcutils.version,
  "font-size: 34px;",
  "font-size: 24px; color: #333;",
  "font-size: 24px; color: brown;",
  "color: #333; font-weight: bold;",
  "color: #333;"
)