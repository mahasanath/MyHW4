// Hello World App


var child = require("child_process");
child.spawn("node", ['ServerInstance1.js'], {
stdio:'inherit'
});
child.spawn("node", ['ServerInstance2.js'],{
stdio:'inherit'
});
child.spawn("node", ['proxyhttp.js'], {
stdio:'inherit'
});
