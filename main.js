const k = 1.380649e-23;
const pi = 3.141592653;
const h = 6.62607e-34;
const c = 299792458;
const e = 2.7118281828;
const sigma = 5.67e-8;
var freq = 0;
var currentcsv = [];
var currentT = 0;
function drawChart(T,d,v) {
    let nu_peak = 2.82 * (k * T) / h;
    let z = 1/(1+(65*d*1000)/c); 
    let nu_obs = nu_peak * (1/(1+(1000*v/c))) * z;
    
    let x_vals = [];
    let y_vals = [];
    let start = nu_obs / 100;
    let end = nu_obs * 10;
    let step = (end - start) / 1000;

    for (let x = start; x <= end; x += step) {
        let b = (2*h*x**3)/(c**2)*(1/(e**((h*x)/(k*T))-1));
        x_vals.push(x);
        y_vals.push(b);
        currentcsv.push([x,b]);
    }

    const lines = [
        { x: 4e14, color: 'red', label: 'red' },
        { x: 5e14, color: 'yellow', label: 'yellow' },
        { x: 5.65e14, color: 'green', label: 'green' },
        { x: 6.8e14, color: 'blue', label: 'blue' },
        { x: 7.9e14, color: 'violet', label: 'violet' },
        { x: nu_obs, color: 'black', label: 'peak', dash: 'dash' }
    ];

    const shapes = lines.map(line => ({
        type: 'line',
        x0: line.x, x1: line.x,
        yref: 'paper', y0: 0, y1: 1,
        line: { color: line.color, width: 3, dash: line.dash || 'dashdot' }
    }));

    const trace = {
        x: x_vals,
        y: y_vals,
        mode: 'lines',
        name: 'Frequency distribution',
        line: { color: 'black', width: 2 }
    };

const layout = {
        title: "Blackbody Radiation Spectrum",
        xaxis: { 
            type: 'log', 
            title: { text: 'Frequency (Hz)', font: { size: 18 } },
            exponentformat: 'e',
            autorange: true 
        },
        yaxis: { 
            title: { text: 'Spectral Radiance', font: { size: 18 } },
            exponentformat: 'e',
            showticklabels: true
        },
        shapes: shapes,
        annotations: true,
        margin: { t: 50, b: 80, l: 80, r: 50 }, 
        showlegend: false
    };

  Plotly.react('myDiv', [trace], layout);
  freq = nu_obs;
  currentT = T;
}

drawChart();

const shownear = document.getElementById('shownear');
const starPresets = [
    ["Proxima Centauri", 3042, 0.000013, 0.2],
    ["Sun",5768,0, 0.696],
    ["Sirius A",9940, 0.000026, 1.2],
    ["Vega",9602,0.00025,1.8],
    ["Rigel",12100,0.0086,55],
    ["Betelgeuse",3500,0.0064, 600]
]

function updateNearest(currentT){
    let nearest = starPresets.reduce((prev, curr) => 
    Math.abs(curr[1] - currentT) < Math.abs(prev[1] - currentT) ? curr : prev);
    shownear.innerHTML = nearest[0];}

shownear.onclick = () => {
        let nearest = starPresets.reduce((prev, curr) => 
    Math.abs(curr[1] - currentT) < Math.abs(prev[1] - currentT) ? curr : prev);
        document.getElementById('tempSlider').value = nearest[1];
        document.getElementById('distSlider').value = nearest[2];
        document.getElementById('radiaslider').value = nearest[3];
        
        document.getElementById('tempVal').innerText = nearest[1];
        document.getElementById('distVal').innerText = nearest[2];
        document.getElementById('radVal').innerText = nearest[3];
        updateAll();
};

function freqToRGB(freq) {
    let wavelength = (3e8 / freq) * 1e9;
    let r, g, b;

    if (wavelength >= 380 && wavelength < 440) {
        r = (-(wavelength - 440) / (440 - 380)); g = 0; b = 1;
    } else if (wavelength >= 440 && wavelength < 490) {
        r = 0; g = (wavelength - 440) / (490 - 440); b = 1;
    } else if (wavelength >= 490 && wavelength < 510) {
        r = 0; g = 1; b = (-(wavelength - 510) / (510 - 490));
    } else if (wavelength >= 510 && wavelength < 580) {
        r = (wavelength - 510) / (580 - 510); g = 1; b = 0;
    } else if (wavelength >= 580 && wavelength < 645) {
        r = 1; g = (-(wavelength - 645) / (645 - 580)); b = 0;
    } else if (wavelength >= 645 && wavelength <= 780) {
        r = 1; g = 0; b = 0;
    } else {
        r = 0; g = 0; b = 0;
    }

    let factor = 0;
    if (wavelength >= 380 && wavelength <= 780) factor = 1;

    let R = Math.round(r * 255 * factor);
    let G = Math.round(g * 255 * factor);
    let B = Math.round(b * 255 * factor);
    let str = `rgb( ${R}, ${G}, ${B})`;
    return str;
}

function updateBulb(nu_obs) {
    const bulb = document.getElementById('bulb');
    const color = freqToRGB(nu_obs);
    
    bulb.style.backgroundColor = color;
    bulb.style.boxShadow = "0 0 20px black";
}

const tSlider = document.getElementById('tempSlider');
const dSlider = document.getElementById('distSlider');
const tShow = document.getElementById('tempVal');
const dShow = document.getElementById('distVal');
const vSlider = document.getElementById('veloslider');
const rSlider = document.getElementById('radiaslider');
const vShow = document.getElementById('veloVal');
const rShow = document.getElementById('radVal');
tSlider.addEventListener('input', updateAll);
dSlider.addEventListener('input', updateAll);
rSlider.addEventListener('input', updateAll);
vSlider.addEventListener('input', updateAll);

function updateAll() {
    let t = parseFloat(tSlider.value);
    let d = parseFloat(dSlider.value);
    let r = parseFloat(rSlider.value);
    let v = parseFloat(vSlider.value);
    
    tShow.innerText = t;
    dShow.innerText = d;
    rShow.innerText = r;
    vShow.innerText = v;
    
    drawChart(t, d, v);
    updateNearest(t);
    updateBulb(freq);
    updateLuminosity(t,r);
}

const lumoshow = document.getElementById('Lumo');
function updateLuminosity(t,r){
    lumoshow.innerHTML = `Luminosity (W): ${(sigma*(t**4)*4*pi*r**2*1e18).toExponential(3)}`;
}


const importer = document.getElementById('import');
importer.onclick = () => {
    const blobData = currentcsv; 
    const blyoba = new Blob(blobData, { type: 'text/csv' }); 
    const url = URL.createObjectURL(blyoba); 
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "planck_spectrum_data.csv"; 
    
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};


updateAll();
