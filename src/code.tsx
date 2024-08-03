//  This is where we can interact with the Figma API
//  draw to the Canvas, and listen for messages from the UI


//  FOR NOW...
//  We're loading the events JSON directly in here
import eventsJSON from './demo_event_descriptions.json';
import stylesAsString from './loadStyles.js';


// This shows the HTML page in "ui.html".
figma.showUI(__html__, {width: 400, height: 600});

figma.ui.postMessage({type: 'eventsDataPush', data: eventsJSON});
figma.ui.postMessage({type: 'cssDataPush', data: stylesAsString})

//  Resize immediately - remembering the last value
figma.clientStorage.getAsync('size').then(size => {
  if(size) figma.ui.resize(size.w,size.h);
}).catch(err=>{});


const chartIconSvgSrc = `
<svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.7778 12.8334H0.777832V1.16675M14.7778 4.66675L10.1112 8.75008L5.4445 5.25008L0.777832 9.33341" stroke="#21242C66" stroke-opacity="1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;


async function createEvent( data: any, position: {x: number, y: number} ) {
  //  set up main frame
  let cardFrame = figma.createFrame();
  cardFrame.cornerRadius = 12;
  cardFrame.fills = [{type : "SOLID", color: { r: 0.839, g: 0.984, b: 0.8 }}];
  cardFrame.x = position && position.x != undefined ? position.x : figma.viewport.center.x - ((figma.viewport.center.x - cardFrame.width) / 2);
  cardFrame.y = position && position.y != undefined ? position.y :  figma.viewport.center.y;
  cardFrame.layoutMode = "VERTICAL";
  cardFrame.paddingLeft = cardFrame.paddingRight = 16;
  cardFrame.paddingTop = cardFrame.paddingBottom = 16;
  cardFrame.primaryAxisSizingMode = "AUTO";
  cardFrame.counterAxisSizingMode = "AUTO";
  cardFrame.primaryAxisAlignItems = "MIN";
  cardFrame.maxWidth = 400;
  cardFrame.itemSpacing = 8;
  cardFrame.name = "CEDAR";
  cardFrame.effects = [{
    type: "DROP_SHADOW",
    color: {r: 0, g: 0, b: 0, a: .15}, 
    offset: { x: 0, y: 4}, 
    radius: 4, 
    visible: true,
    blendMode: "NORMAL" 
  }, 
  {
    type: "DROP_SHADOW",
    color: {r: 0, g: 0, b: 0, a: .15}, 
    offset: { x: 0, y: 8}, 
    radius: 8, 
    visible: true,
    blendMode: "NORMAL" 
  },
  {
    type: "DROP_SHADOW",
    color: {r: 0, g: 0, b: 0, a: .15}, 
    offset: { x: 0, y: 16}, 
    radius: 16, 
    visible: true,
    blendMode: "NORMAL" 
  }];


  //  set up header frame
  let headerFrame = figma.createFrame();
  headerFrame.name = "Header";
  headerFrame.layoutMode = "HORIZONTAL";
  headerFrame.primaryAxisSizingMode = "AUTO";
  headerFrame.counterAxisSizingMode = "AUTO";
  headerFrame.counterAxisAlignItems = "CENTER";
  headerFrame.itemSpacing = 8;
  headerFrame.fills = [];
  headerFrame.locked = true;

  //  icon
  const iconNode = figma.createNodeFromSvg(chartIconSvgSrc);
  iconNode.locked = true;
  iconNode.name = "Icon";
  headerFrame.appendChild(iconNode);

  // title
  let title = figma.createText();
  let boldFont = {family: "Roboto Mono", style: "Bold"};
  await figma.loadFontAsync(boldFont);
  title.fontName = boldFont;
  title.locked = data.isNew? false : true;
  title.characters = data.name;
  title.fontSize = 14;
  title.fills = [figma.util.solidPaint("#21242CFF")];
  headerFrame.appendChild(title);

  cardFrame.appendChild(headerFrame);


  let description = figma.createText();
  let font = {family: "Inter", style: "Regular"};
  await figma.loadFontAsync(font);
  description.fontName = font;
  description.fontSize = 12;
  description.characters = "Notes";
  description.layoutAlign = "STRETCH";
  description.textAutoResize = "WIDTH_AND_HEIGHT";
  description.characters = data.description;
  description.fills = [figma.util.solidPaint("#21242CCC")];
  description.fontSize = 14;
  cardFrame.appendChild(description);
  description.visible = false;


  //  IsNew?
  if (data.isNew){
    description.visible = true;

    // Create NEW label
    let label = figma.createText();
    let boldFont = {family: "Inter", style: "Bold"};
    await figma.loadFontAsync(boldFont);
    label.fontName = boldFont;
    label.fontSize = 9;
    label.characters = "NEW";
    label.fills = [figma.util.solidPaint("#FFFFFF")];
    label.textCase = "UPPER";

    let labelFrame = figma.createFrame();
    labelFrame.layoutMode = "VERTICAL";
    labelFrame.paddingLeft = labelFrame.paddingRight = 6;
    labelFrame.paddingTop = labelFrame.paddingBottom = 4;
    labelFrame.primaryAxisSizingMode = "AUTO";
    labelFrame.counterAxisSizingMode = "AUTO";
    labelFrame.name = "Label Pill";
    labelFrame.cornerRadius = 16;
    labelFrame.fills = [figma.util.solidPaint("#1865F2")];
    labelFrame.locked = true;
    labelFrame.appendChild(label);

    headerFrame.appendChild(labelFrame);   //  attach the NEW label
    headerFrame.locked = false;

  }

  figma.currentPage.appendChild(cardFrame);
  figma.currentPage.selection = [cardFrame];

}


// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async msg => {

  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if(msg.function === 'fetchError') {

  } else if (msg.type === "resize") {
    resize(msg.size.w, msg.size.h)   
  } else if (msg.type === 'resizeEnd'){
    figma.clientStorage.setAsync('size', msg.size).catch(err=>{});// save size
  } else if (msg.dropPosition) {
    //  drag and drop
    const { data, dropPosition, windowSize, offset } = msg;
    const bounds = figma.viewport.bounds;
    const zoom = figma.viewport.zoom;
    const hasUI = Math.round(bounds.width * zoom) !== windowSize.width;
    const leftPaneWidth = windowSize.width - bounds.width * zoom - 240;
    const xFromCanvas = hasUI ? dropPosition.clientX - leftPaneWidth : dropPosition.clientX;
    const yFromCanvas = hasUI ? dropPosition.clientY - 40 : dropPosition.clientY;
    const newPosition = {
      x: bounds.x + xFromCanvas / zoom - offset.x,
      y: bounds.y + yFromCanvas / zoom - offset.y,   
    }    
    createEvent(data, newPosition);
  } 

  function resize (w: number, h: number){
    w = Math.min(700, Math.max(400, Math.floor(w)))
    h = Math.min(1000, Math.max(350, Math.floor(h)))
    figma.ui.resize(w, h);   
  }

}

