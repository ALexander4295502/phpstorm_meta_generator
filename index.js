const tintMap = {
    ioi: '#024774',
    adaptasoft: '#7EB92B',
    benefitmall: '#94c947',
    platinumhire: '#19549D',
    netchex: '#54a947',
    mpay: '#F7901E',
    bdb: '#201550',
    jetpay: '#4fba47',
    getbeyond: '#29455a',
    payworks: '#e0703d',
    henryschein: '#666',
    thinkware: '#1d4a89',
    iconnect: '#275fac',
    primepay: '#395f79',
    smartlinx: '#1391CB',
    execupay: '#005892',
    kellyway: '#0d553f',
    netpay: '#59ae26',
    sage: '#009FDA',
    cyberpay: '#7eb92b',
    fisglobal: '#8DC63F',
    "937payroll": '#59ae26',
    heartland: '#DA291C',
    maypaycenter: '#fce4e7',
    viventium: '#824d9f',
    clover: '#43B02A',
    gethired: '#60CC9C',
    globalpayments: '#70A546',
    myhrconcierge: '#FCD110',
};


const replaceColor = require('replace-color');
const Jimp = require('jimp');

(async () => {
    const leftIcon = await Jimp.read('./assets/arrow_left.png');
    const rightIcon = await Jimp.read('./assets/arrow_right.png');

    Object.keys(tintMap).map((partner) => {
        var replacedColor = tintMap[partner];

        replaceColor({
            image: './assets/collapse_prototype.png',
            colors: {
                type: 'hex',
                targetColor: '#da281c',
                replaceColor: replacedColor
            }
        }, (err, jimpObject) => {
            if (err) return console.log(err);
            const savePath = `./collapse_wing_${partner}.png`;

            jimpObject.composite(leftIcon, 10, 21).write(savePath, (err) => {
                if (err) return console.log(err)
            });
        })

        replaceColor({
            image: './assets/expand_prototype.png',
            colors: {
                type: 'hex',
                targetColor: '#da281c',
                replaceColor: replacedColor
            }
        }, (err, jimpObject) => {
            if (err) return console.log(err);
            const savePath = `./expand_wing_${partner}.png`;

            jimpObject.composite(rightIcon, 10, 21).write(savePath, (err) => {
                if (err) return console.log(err)
            });
        })
    });
})();
