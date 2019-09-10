const tintMap = {
    ioi: '#024774',
    benefitmall: '#005892',
    netchex: '#54a947',
    mpay: '#3883c0',
    bdb: '#201550',
    jetpay: '#1253a5',
    getbeyond: '#29455a',
    payworks: '#e0703d',
    henryschein: '#666',
    thinkware: '#1d4a89',
    iconnect: '#275fac',
    primepay: '#395f79',
    smartlinx: '#1391CB',
    gethired: '#0060CA',
    execupay: '#005892',
    kellyway: '#0d553f',
    netpay: '#59ae26',
    sage: '#009FDA'
};


const replaceColor = require('replace-color')

Object.keys(tintMap).map((partner) => {
    var replacedColor = tintMap[partner];

    replaceColor({
        image: './collapse_wing.png',
        colors: {
            type: 'hex',
            targetColor: '#da281c',
            replaceColor: replacedColor
        }
    }, (err, jimpObject) => {
        if (err) return console.log(err)
        jimpObject.write(`./collapse_wing_${partner}.png`, (err) => {
            if (err) return console.log(err)
        })
    })

    replaceColor({
        image: './expand_wing.png',
        colors: {
            type: 'hex',
            targetColor: '#da281c',
            replaceColor: replacedColor
        }
    }, (err, jimpObject) => {
        if (err) return console.log(err)
        jimpObject.write(`./expand_wing_${partner}.png`, (err) => {
            if (err) return console.log(err)
        })
    })
});