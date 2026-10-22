const SLOT_WIDTH_MM = 3.4;
const SLOT_GAP_MM = 4;
const MAX_VISIBLE_SLOTS = 5000;
const SVG_NS = "http://www.w3.org/2000/svg";
const form = document.querySelector("#calculator-form");
const radiusInput = document.querySelector("#radius");
const thicknessInput = document.querySelector("#thickness");
const angleInput = document.querySelector("#angle");
const widthInput = document.querySelector("#width");
const startMarginInput = document.querySelector("#start-margin");
const endMarginInput = document.querySelector("#end-margin");
const errorMessage = document.querySelector("#error-message");
const drawingContent = document.querySelector("#drawing-content");
const drawing = document.querySelector("#drawing");
const downloadButton = document.querySelector("#download-button");
const numberFormat = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatNumber(value) {
  return numberFormat.format(value);
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [attribute, value] of Object.entries(attributes)) {
    element.setAttribute(attribute, String(value));
  }
  return element;
}

function addDimensionLine(fragment, x1, x2, y, label) {
  fragment.push(
    svgElement("line", {
      x1,
      y1: y,
      x2,
      y2: y,
      stroke: "#8798a9",
      "stroke-width": 1,
      "marker-start": "url(#arrow)",
      "marker-end": "url(#arrow)",
    }),
  );

  const text = svgElement("text", {
    x: (x1 + x2) / 2,
    y: y - 5,
    fill: "#64798d",
    "font-size": 9,
    "font-family": "DM Mono, monospace",
    "text-anchor": "middle",
    "paint-order": "stroke",
    stroke: "#fcfdfe",
    "stroke-width": 4,
    "stroke-linejoin": "round",
  });
  text.textContent = label;
  fragment.push(text);
}

function renderDrawing(totalLength, arcLength, radius, thickness, angle, width, startMargin, endMargin, slotCount) {
  drawingContent.replaceChildren();

  const xStart = 58;
  const xEnd = 690;
  const pieceWidth = xEnd - xStart;
  const scale = pieceWidth / totalLength;
  const yTop = 96;
  const stripHeight = 70;
  const startArcX = xStart + startMargin * scale;
  const endArcX = startArcX + arcLength * scale;
  const endMarginX = xEnd - endMargin * scale;

  const elements = [
    svgElement("rect", {
      x: xStart,
      y: yTop,
      width: pieceWidth,
      height: stripHeight,
      rx: 2,
      fill: "#eaf2fc",
      stroke: "#6d9dd5",
      "stroke-width": 1.5,
    }),
    svgElement("rect", {
      x: xStart,
      y: yTop,
      width: startArcX - xStart,
      height: stripHeight,
      fill: "#f8e4c9",
    }),
    svgElement("rect", {
      x: endMarginX,
      y: yTop,
      width: xEnd - endMarginX,
      height: stripHeight,
      fill: "#f8e4c9",
    }),
    svgElement("line", {
      x1: startArcX,
      y1: yTop - 6,
      x2: startArcX,
      y2: yTop + stripHeight + 7,
      stroke: "#d9913d",
      "stroke-width": 1.2,
      "stroke-dasharray": "3 3",
    }),
    svgElement("line", {
      x1: endArcX,
      y1: yTop - 6,
      x2: endArcX,
      y2: yTop + stripHeight + 7,
      stroke: "#d9913d",
      "stroke-width": 1.2,
      "stroke-dasharray": "3 3",
    }),
  ];

  const slotPitch = SLOT_WIDTH_MM + SLOT_GAP_MM;
  const visibleSlotWidth = Math.max(1.4, SLOT_WIDTH_MM * scale);
  for (let index = 0; index < slotCount; index += 1) {
    const slotX = startArcX + index * slotPitch * scale;
    elements.push(
      svgElement("rect", {
        x: slotX,
        y: yTop + 1,
        width: visibleSlotWidth,
        height: stripHeight - 2,
        fill: "#fff",
        stroke: "#4c78a7",
        "stroke-width": 0.65,
        "vector-effect": "non-scaling-stroke",
      }),
    );
  }

  const radiusLabel = svgElement("text", {
    x: xEnd,
    y: 37,
    fill: "#788b9e",
    "font-size": 9,
    "font-family": "DM Mono, monospace",
    "text-anchor": "end",
  });
  radiusLabel.textContent = `R ext. ${formatNumber(radius)} · e ${formatNumber(thickness)} · θ ${formatNumber(angle)}°`;
  elements.push(radiusLabel);

  const arcLabel = svgElement("text", {
    x: (startArcX + endArcX) / 2,
    y: 76,
    fill: "#42678e",
    "font-size": 10,
    "font-family": "DM Mono, monospace",
    "text-anchor": "middle",
  });
  arcLabel.textContent = `Arco ${formatNumber(arcLength)} mm · ${slotCount} sulcos`;
  elements.push(arcLabel);

  const startLabel = svgElement("text", {
    x: (xStart + startArcX) / 2,
    y: 188,
    fill: "#9a6c36",
    "font-size": 8,
    "font-family": "DM Mono, monospace",
    "text-anchor": "middle",
  });
  startLabel.textContent = `${formatNumber(startMargin)} mm`;
  elements.push(startLabel);

  const endLabel = svgElement("text", {
    x: (endMarginX + xEnd) / 2,
    y: 188,
    fill: "#9a6c36",
    "font-size": 8,
    "font-family": "DM Mono, monospace",
    "text-anchor": "middle",
  });
  endLabel.textContent = `${formatNumber(endMargin)} mm`;
  elements.push(endLabel);

  addDimensionLine(elements, xStart, startArcX, 198, "INÍCIO");
  addDimensionLine(elements, endMarginX, xEnd, 198, "FIM");

  const widthLineX = 720;
  elements.push(
    svgElement("line", {
      x1: widthLineX,
      y1: yTop,
      x2: widthLineX,
      y2: yTop + stripHeight,
      stroke: "#60758b",
      "stroke-width": 1.2,
      "marker-start": "url(#arrow)",
      "marker-end": "url(#arrow)",
    }),
  );

  const widthLabel = svgElement("text", {
    x: 746,
    y: yTop + stripHeight / 2,
    fill: "#304961",
    "font-size": 9,
    "font-family": "DM Mono, monospace",
    "text-anchor": "middle",
    transform: `rotate(90 746 ${yTop + stripHeight / 2})`,
  });
  widthLabel.textContent = `Largura ${formatNumber(width)} mm`;
  elements.push(widthLabel);

  elements.push(
    svgElement("line", {
      x1: xStart,
      y1: 255,
      x2: xEnd,
      y2: 255,
      stroke: "#60758b",
      "stroke-width": 1.3,
      "marker-start": "url(#arrow)",
      "marker-end": "url(#arrow)",
    }),
  );

  const totalLabel = svgElement("text", {
    x: (xStart + xEnd) / 2,
    y: 246,
    fill: "#304961",
    "font-size": 12,
    "font-family": "DM Mono, monospace",
    "font-weight": 500,
    "text-anchor": "middle",
    "paint-order": "stroke",
    stroke: "#fcfdfe",
    "stroke-width": 5,
    "stroke-linejoin": "round",
  });
  totalLabel.textContent = `COMPRIMENTO TOTAL = ${formatNumber(totalLength)} mm`;
  elements.push(totalLabel);

  drawingContent.append(...elements);
  document.querySelector("#drawing-desc").textContent =
    `Chapa planificada de ${formatNumber(totalLength)} por ${formatNumber(width)} mm. Trecho reto inicial de ${formatNumber(startMargin)} mm, arco de ${formatNumber(arcLength)} mm com ${slotCount} sulcos de 3,4 mm atravessando a largura e vão de 4 mm entre sulcos, seguido de trecho reto final de ${formatNumber(endMargin)} mm.`;
}

function calculate() {
  const radius = radiusInput.valueAsNumber;
  const thickness = thicknessInput.valueAsNumber;
  const angle = angleInput.valueAsNumber;
  const width = widthInput.valueAsNumber;
  const startMargin = startMarginInput.valueAsNumber;
  const endMargin = endMarginInput.valueAsNumber;

  errorMessage.hidden = true;
  errorMessage.textContent = "";

  if (![radius, thickness, angle, width, startMargin, endMargin].every(Number.isFinite)) {
    errorMessage.textContent = "Preencha o raio, a espessura, o ângulo, a largura e os dois trechos retos.";
    errorMessage.hidden = false;
    downloadButton.disabled = true;
    return;
  }

  if (radius <= 0 || thickness <= 0 || width <= 0 || angle <= 0 || angle > 360 || startMargin < 0 || endMargin < 0) {
    errorMessage.textContent = "Raio, espessura, largura e ângulo devem ser maiores que zero; os trechos retos não podem ser negativos.";
    errorMessage.hidden = false;
    downloadButton.disabled = true;
    return;
  }

  const neutralRadius = radius - thickness / 2;
  if (neutralRadius <= 0) {
    errorMessage.textContent = "O raio externo precisa ser maior que metade da espessura do material.";
    errorMessage.hidden = false;
    downloadButton.disabled = true;
    return;
  }

  const arcLength = neutralRadius * angle * Math.PI / 180;
  const totalLength = startMargin + arcLength + endMargin;
  const slotPitch = SLOT_WIDTH_MM + SLOT_GAP_MM;
  const slotCount = Math.floor((arcLength + SLOT_GAP_MM) / slotPitch);

  if (!Number.isFinite(totalLength) || !Number.isSafeInteger(slotCount) || slotCount > MAX_VISIBLE_SLOTS) {
    errorMessage.textContent = `As dimensões resultariam em mais de ${MAX_VISIBLE_SLOTS.toLocaleString("pt-BR")} sulcos. Reduza o raio ou o ângulo para gerar o desenho.`;
    errorMessage.hidden = false;
    downloadButton.disabled = true;
    return;
  }

  downloadButton.disabled = false;
  document.querySelector("#total-length").textContent = formatNumber(totalLength);
  document.querySelector("#neutral-radius").innerHTML = `${formatNumber(neutralRadius)} <small>mm</small>`;
  document.querySelector("#arc-length").innerHTML = `${formatNumber(arcLength)} <small>mm</small>`;
  document.querySelector("#cut-count").textContent = `${slotCount} un.`;
  document.querySelector("#result-detail").textContent =
    `${formatNumber(startMargin)} mm retos + ${formatNumber(arcLength)} mm de arco + ${formatNumber(endMargin)} mm retos`;
  renderDrawing(totalLength, arcLength, radius, thickness, angle, width, startMargin, endMargin, slotCount);
}

function downloadDrawing() {
  const clone = drawing.cloneNode(true);
  clone.setAttribute("xmlns", SVG_NS);
  clone.setAttribute("width", "1200");
  clone.setAttribute("height", "427");

  const header = svgElement("text", {
    x: 58,
    y: 24,
    fill: "#304961",
    "font-size": 15,
    "font-family": "Arial, sans-serif",
  });
  header.textContent = "CHAPA CURVA — VISTA PLANIFICADA COM SULCOS";

  const footer = svgElement("text", {
    x: 58,
    y: 278,
    fill: "#788b9e",
    "font-size": 10,
    "font-family": "Arial, sans-serif",
  });
  footer.textContent = "Sulcos de 3,4 mm de abertura, com 4 mm livres entre cortes, atravessando a largura. Medidas em mm.";

  const content = clone.querySelector("#drawing-content");
  content.insertBefore(header, content.firstChild);
  content.append(footer);

  const svgText = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${svgText}`], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "chapa-planificada-com-sulcos.svg";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

form.addEventListener("input", calculate);
form.addEventListener("submit", (event) => event.preventDefault());
downloadButton.addEventListener("click", downloadDrawing);
calculate();
