const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const state = { lang: 'en', angle: 0, mode: 'angle', preview: 'sensor' };
const cameraLooks = [
  'Тёплая естественная кожа, широкий динамический диапазон и мягкий roll-off в светах.',
  'Крупноформатная объёмность, кремовые оттенки кожи и деликатное падение резкости.',
  'Чистая full-frame детализация, нейтральный цвет и аккуратные холодные тени.',
  'Выраженный микроконтраст, чёткая детализация и насыщенный контролируемый цвет.',
  'Нейтральный filmic color, тонкая фактура и широкий тональный диапазон.',
  'Органическая 35-мм плёнка: тёплое зерно, мягкая halation и живые оттенки кожи.',
  'Масштабная 65-мм пластика, кремовое разделение планов и богатая тональная шкала.'
];
const focalStops = [8,12,18,25,35,50,85,135];
const focalLooks = [
  'Fisheye: круговой охват и выраженная бочкообразная перспектива.',
  'Ultra-wide: максимум среды и динамичная перспектива без fisheye.',
  'Сильная широкоугольная перспектива, объёмное окружение.',
  'Динамичная пространственная перспектива.',
  'Кинематографичный environmental portrait.',
  'Натуральная перспектива, близкая человеческому восприятию.',
  'Льстивая портретная компрессия и мягкий фон.',
  'Сильное сжатие пространства и узкий фон.'
];
const cameraPreviewFiles=['arri-alexa-35','arri-alexa-mini-lf','sony-venice-2','red-v-raptor-xl','blackmagic-ursa-cine-12k','arricam-lt-kodak-vision3','panavision-system-65'];
const apertureStops=[14,20,28,40,56,80,110];
const apertureLooks={14:'Очень малая ГРИП · крупное овальное боке',20:'Малая ГРИП · сильное отделение героя',28:'Киношный баланс резкости и объёма',40:'Умеренная ГРИП · окружение читается',56:'Глубокая резкость · спокойное боке',80:'Почти вся сцена в резкости',110:'Максимальная глубина резкости'};
const angleGuides=[
  {name:'На уровне глаз',note:'Нейтральный взгляд без давления',kind:'side',height:0,x:'8%',y:'50%',rot:'0deg',ray:'43%',rayRot:'180deg'},
  {name:'Нижний ракурс',note:'Камера снизу усиливает героя',kind:'side',height:-2,x:'10%',y:'78%',rot:'-18deg',ray:'42%',rayRot:'158deg'},
  {name:'Сильно снизу',note:'Ground-up, выразительная перспектива',kind:'side',height:-3,x:'18%',y:'88%',rot:'-27deg',ray:'38%',rayRot:'147deg'},
  {name:'Верхний ракурс',note:'Камера смотрит сверху вниз',kind:'side',height:2,x:'12%',y:'18%',rot:'18deg',ray:'42%',rayRot:'202deg'},
  {name:'Top shot 90°',note:'Камера строго над центром сцены',kind:'top',height:3,x:'47%',y:'5%',rot:'90deg',ray:'34%',rayRot:'-90deg'},
  {name:'Bird’s-eye view',note:'Высоко над сценой, видна география',kind:'top',height:3,x:'14%',y:'8%',rot:'35deg',ray:'47%',rayRot:'218deg'}
];
const coverageShots={
  reverse:{ru:'ответный обратный кадр через противоположное плечо, сохранена ось 180° и зеркально согласованная линия взгляда',en:'matching reverse over-the-shoulder shot, preserving the 180-degree line and mirrored eyeline'},
  top:{ru:'строгий top shot под 90° сверху, камера точно над центром действия, вертикали не завалены',en:'strict 90-degree top shot, camera directly above the action center, verticals geometrically true'},
  bird:{ru:'высокий bird’s-eye view с высоты, раскрывающий географию всей сцены и положение героя в пространстве',en:'high bird’s-eye view revealing the full scene geography and the subject’s position in space'},
  profile:{ru:'чистый боковой профиль под 90° на уровне глаз, направление взгляда и положение тела сохранены',en:'clean 90-degree side profile at eye level, preserving eyeline and body position'},
  wide:{ru:'общий establishing shot той же сцены, герой полностью читается в окружении, география пространства ясна',en:'wide establishing shot of the same scene, full subject readable within clearly established geography'},
  detail:{ru:'точный insert-крупный план значимой детали сцены с теми же материалами, светом и цветом',en:'precise insert close-up of a meaningful scene detail with matching materials, light, and color'}
};

const orbitLabels = (a, lang = 'ru') => {
  const abs = Math.abs(a), sideRu = a < 0 ? 'справа' : 'слева', sideEn = a < 0 ? 'right' : 'left';
  if (abs < 8) return lang === 'ru' ? 'фронтально' : 'front view';
  if (abs > 172) return lang === 'ru' ? 'со спины' : 'rear view';
  if (abs < 30) return lang === 'ru' ? `лёгкий ракурс ${sideRu}` : `slight ${sideEn} angle`;
  if (abs < 70) return lang === 'ru' ? `три четверти ${sideRu}` : `three-quarter view from camera-${sideEn}`;
  if (abs < 110) return lang === 'ru' ? `профиль ${sideRu}` : `${sideEn} profile view`;
  return lang === 'ru' ? `задние три четверти ${sideRu}` : `rear three-quarter view from camera-${sideEn}`;
};
const heightLabels = { ru: ['сильно снизу','нижний ракурс','слегка снизу','на уровне глаз','слегка сверху','верхний ракурс','сильно сверху'], en: ['very low angle','low angle','slightly low angle','eye level','slightly high angle','high angle','very high angle'] };
const distanceLabels = { ru: ['близко','средняя','далеко'], en: ['close','medium','far'] };
const framingByFocal = (f) => f < 25 ? ['широкоугольный кадр','wide-angle shot'] : f < 40 ? ['средне-широкий кадр','medium-wide shot'] : f < 70 ? ['естественная перспектива','natural perspective'] : f < 100 ? ['сжатая перспектива','compressed perspective'] : ['выраженное сжатие планов','strong perspective compression'];

function buildPrompt() {
  const ru = state.lang === 'ru';
  const camera = $('#camera').selectedOptions[0];
  const lens = $('#lensFamily').selectedOptions[0];
  const focal = +$('#focal').value;
  const aperture = (+$('#aperture').value / 10).toFixed(1);
  const h = +$('#height').value + 3, d = +$('#distance').value - 1;
  const subject = $('#subject').value.trim() || (ru ? 'объект из исходного изображения' : 'the subject from the source image');
  const modeRu = { angle: '', reverse: 'Режим обратного кадра диалоговой «восьмёрки»: показать противоположную сторону сцены от персонажа, сохраняя линию взгляда и правило 180°. Тот же герой может оставаться мягким over-the-shoulder силуэтом на переднем плане. Экранное направление собеседника противоположно исходному кадру.', eight: 'Режим консистентного фона для диалоговой «восьмёрки»: создать чистый background plate противоположной стороны пространства, без персонажей на переднем плане. Это та же локация с ответной позиции камеры за плечом персонажа. Строго сохранить географию сцены, объекты, архитектуру, материалы, время суток, направление и жёсткость света, цветовую температуру и экспозицию.' };
  const modeEn = { angle: '', reverse: 'Reverse shot mode for a shot/reverse-shot dialogue setup: reveal the opposite side of the scene while preserving eyeline and the 180-degree rule. The same character may remain as a soft over-the-shoulder foreground silhouette. The counterpart’s screen direction must oppose the source shot.', eight: 'Consistent shot/reverse-shot background plate mode: generate a clean background of the opposite side of the space, with no foreground characters. This is the exact same location from the matching reverse camera position behind the character. Strictly preserve scene geography, objects, architecture, materials, time of day, light direction and hardness, color temperature and exposure.' };
  const anamorphicRu = $('#anamorphic').checked ? 'Анаморфотная съёмка: коэффициент сжатия 2×, выраженное овальное боке, мягкое горизонтальное растяжение бликов, контролируемые горизонтальные flare, характерный focus falloff по краям и лёгкое оптическое дыхание; без искусственного цифрового эффекта.' : '';
  const anamorphicEn = $('#anamorphic').checked ? 'Anamorphic capture: 2× squeeze, distinctly oval bokeh, gentle horizontal highlight stretch, controlled horizontal flares, characteristic edge focus falloff and subtle lens breathing; no artificial digital effect.' : '';
  const identityRu = state.mode === 'eight' ? 'Не добавлять новых людей, силуэтов или предметов; сохранить абсолютную визуальную непрерывность пространства исходного изображения.' : 'Строго сохранить идентичность персонажа, черты лица, пропорции, причёску, одежду, позу и непрерывность окружения исходного изображения; изменить только положение камеры и естественно раскрыть ранее невидимые поверхности.';
  const identityEn = state.mode === 'eight' ? 'Do not add new people, silhouettes or props; preserve absolute visual continuity with the space in the source image.' : 'Strictly preserve the subject’s identity, facial features, proportions, hairstyle, wardrobe, pose and environmental continuity from the source image; change only the camera position and plausibly reveal previously unseen surfaces.';
  const movement = CAMERA_MOVEMENTS.find(m=>m.name===$('#cameraMovement').value);
  const speedRu={slow:'медленный',medium:'средний',fast:'быстрый'},speedEn={slow:'slow',medium:'medium',fast:'fast'};
  const motionRu = $('#motionEnabled').checked && movement ? `Движение камеры — ${movement.name} (${movement.category}). ${movementRule(movement,'ru')} Темп: ${speedRu[$('#motionSpeed').value]}, длительность: ${$('#motionDuration').value}. Одно непрерывное движение без монтажной склейки.` : '';
  const motionEn = $('#motionEnabled').checked && movement ? `Camera movement — ${movement.name} (${movement.category}). ${movementRule(movement,'en')} Pace: ${speedEn[$('#motionSpeed').value]}, duration: ${$('#motionDuration').value.replace('сек','sec')}. One continuous move with no edit.` : '';
  const coverage = [['B','#cameraBEnabled','#cameraBShot'],['C','#cameraCEnabled','#cameraCShot']].filter(([,enabled])=>$(enabled).checked).map(([name,,shot])=>({name,shot:coverageShots[$(shot).value]}));
  const coverageRu = coverage.length ? `Дополнительный coverage той же сцены:\n${coverage.map(c=>`CAMERA ${c.name}: ${c.shot.ru}. Та же камера, сенсор, оптика, цвет, экспозиция, персонаж, костюм, локация и направление света, что в CAMERA A.`).join('\n')} Все камеры принадлежат одному непрерывному пространству и одному моменту времени; никаких новых объектов или изменений декораций.` : '';
  const coverageEn = coverage.length ? `Additional coverage of the exact same scene:\n${coverage.map(c=>`CAMERA ${c.name}: ${c.shot.en}. Match CAMERA A camera system, sensor, lens family, color, exposure, character, wardrobe, location, and light direction.`).join('\n')} Every camera belongs to one continuous space and the same moment in time; introduce no new objects or set changes.` : '';
  const characterCardRu = $('#characterCard').checked ? 'КАРТА ПЕРСОНАЖА: создать нейтральный эталон одного и того же героя — фронт, профиль слева, профиль справа, ¾ слева, ¾ справа и полный рост; одинаковые лицо, возраст, пропорции, кожа, волосы, костюм и аксессуары, нейтральный свет, без смены идентичности.' : '';
  const characterCardEn = $('#characterCard').checked ? 'CHARACTER CARD: create a neutral reference of the exact same character — front, left profile, right profile, left 3/4, right 3/4, and full body; identical face, age, proportions, skin, hair, wardrobe, and accessories, neutral light, no identity drift.' : '';
  const locationCardRu = $('#locationCard').checked ? 'КАРТА ЛОКАЦИИ: создать консистентный эталон пространства — общий вид, четыре стороны света, top-down план и ключевые детали; зафиксировать географию, размеры, архитектуру, материалы, реквизит, время суток, источники света, тени и цветовую температуру.' : '';
  const locationCardEn = $('#locationCard').checked ? 'LOCATION CARD: create a consistent environment reference — master wide, four compass directions, top-down layout, and key details; lock geography, scale, architecture, materials, props, time of day, light sources, shadows, and color temperature.' : '';
  const parts = ru ? [
    `Переснять сцену: ${subject}.`,
    modeRu[state.mode],
    `Камера перемещена по орбите на ${Math.abs(state.angle)}° ${state.angle < 0 ? 'вправо' : state.angle > 0 ? 'влево' : 'без бокового смещения'} относительно исходного фронтального положения — ${orbitLabels(state.angle)}. Камера направлена точно на объект, ${heightLabels.ru[h]}, дистанция ${distanceLabels.ru[d]}.`,
    `Снято на ${camera.textContent}, сенсор ${camera.dataset.sensor}, кинообъектив ${lens.textContent}, ${focal} мм, T${aperture}; ${framingByFocal(focal)[0]}. Характер оптики: ${lens.dataset.look}.`,
    coverageRu,
    characterCardRu,
    locationCardRu,
    motionRu,
    anamorphicRu,
    $('#photoreal').checked ? 'Максимальный фотореализм: естественная текстура кожи, микродетали ткани, физически корректный свет и правдоподобные материалы.' : '',
    $('#cinematic').checked ? 'Кинематографичный кадр: мягкий roll-off в светах, широкий динамический диапазон, тонкая плёночная зернистость, деликатный color grading, естественная глубина резкости.' : '',
    $('#identity').checked ? identityRu : '',
    $('#physics').checked ? 'Геометрически согласованная перспектива, корректный параллакс, правдоподобная пространственная реконструкция, без деформаций.' : ''
  ] : [
    `Re-shoot the scene: ${subject}.`,
    modeEn[state.mode],
    `Move the camera on an orbit by ${Math.abs(state.angle)}° to camera-${state.angle < 0 ? 'right' : state.angle > 0 ? 'left' : 'center'} from the original frontal position — ${orbitLabels(state.angle, 'en')}. Aim directly at the subject, ${heightLabels.en[h]}, ${distanceLabels.en[d]} camera distance.`,
    `Shot on ${camera.textContent}, ${camera.dataset.sensor}, ${lens.textContent} cinema lens, ${focal}mm, T${aperture}; ${framingByFocal(focal)[1]}. Lens character: ${lens.dataset.look}.`,
    coverageEn,
    characterCardEn,
    locationCardEn,
    motionEn,
    anamorphicEn,
    $('#photoreal').checked ? 'Maximum photorealism: natural skin texture, fabric micro-detail, physically accurate lighting and believable materials.' : '',
    $('#cinematic').checked ? 'Cinematic image: smooth highlight roll-off, wide dynamic range, subtle film grain, restrained color grade, natural depth of field.' : '',
    $('#identity').checked ? identityEn : '',
    $('#physics').checked ? 'Geometrically consistent perspective, correct parallax, plausible spatial reconstruction, no warping.' : ''
  ];
  $('#promptOutput').textContent = parts.filter(Boolean).join('\n\n');
}

function updateStage(angle = +$('#orbit').value) {
  state.angle = Math.max(-180, Math.min(180, Math.round(angle)));
  $('#orbit').value = state.angle;
  const label = `${state.angle}° · ${orbitLabels(state.angle)}`;
  $('#orbitOut').value = label; $('#angleBadge').textContent = label;
  $('#cameraASummary').textContent = `${state.angle}° · ${heightLabels.ru[+$('#height').value+3]}`;
  const stage = $('#stage'), r = Math.min(stage.clientWidth, stage.clientHeight) * .37;
  const rad = state.angle * Math.PI / 180;
  const x = stage.clientWidth / 2 + Math.sin(rad) * r;
  const y = stage.clientHeight / 2 + Math.cos(rad) * r;
  const cam = $('#cameraMarker'); cam.style.left = `${x}px`; cam.style.top = `${y}px`; cam.style.transform = `translate(-50%,-50%) rotate(${-state.angle}deg)`;
  $('#rayLine').setAttribute('x2', x); $('#rayLine').setAttribute('y2', y);
  buildPrompt();
}

function updateReadouts() {
  $('#focalOut').value = `${$('#focal').value} мм`;
  $('#apertureOut').value = `T${(Number($('#aperture').value) / 10).toFixed(1)}`;
  $('#heightOut').value = heightLabels.ru[+$('#height').value + 3];
  $('#cameraASummary').textContent = `${state.angle}° · ${heightLabels.ru[+$('#height').value+3]}`;
  $('#distanceOut').value = distanceLabels.ru[+$('#distance').value - 1];
  $('#sensorReadout').textContent = $('#camera').selectedOptions[0].dataset.sensor;
  updatePreview();
  buildPrompt();
  if ($('#focalAtlas')?.children.length) markAtlasActive();
}

function nearestFocalIndex(value) { return focalStops.reduce((best, n, i) => Math.abs(n-value) < Math.abs(focalStops[best]-value) ? i : best, 0); }
function updatePreview() {
  const image = $('#previewImage');
  if (state.preview === 'sensor') {
    const i = $('#camera').selectedIndex;
    image.style.backgroundImage = `url('assets/previews/cameras/${cameraPreviewFiles[i]}.png')`;
    image.style.backgroundSize = 'contain';
    image.style.backgroundPosition = 'center';
    $('#previewTitle').textContent = `${$('#camera').selectedOptions[0].textContent} · 50 мм`;
    $('#previewCaption').textContent = cameraLooks[i];
  } else {
    const i = nearestFocalIndex(+$('#focal').value);
    image.style.backgroundImage = `url('assets/previews/focals/${focalStops[i]}mm.png')`;
    image.style.backgroundSize = 'contain';
    image.style.backgroundPosition = 'center';
    $('#previewTitle').textContent = `${focalStops[i]} мм · ближайший эталон`;
    $('#previewCaption').textContent = focalLooks[i];
  }
}

function setPreview(type) { state.preview=type; $('#showSensor').classList.toggle('active',type==='sensor'); $('#showFocal').classList.toggle('active',type==='focal'); updatePreview(); }
$('#showSensor').addEventListener('click',()=>setPreview('sensor'));
$('#showFocal').addEventListener('click',()=>setPreview('focal'));
$('#camera').addEventListener('change',()=>setPreview('sensor'));
$('#focal').addEventListener('input',()=>setPreview('focal'));

function markAtlasActive(){
  $$('.focal-card').forEach(c=>c.classList.toggle('active',+c.dataset.focal===+$('#focal').value));
  $$('.aperture-card').forEach(c=>c.classList.toggle('active',+c.dataset.aperture===+$('#aperture').value));
  $$('.angle-card').forEach(c=>c.classList.toggle('active',angleGuides[+c.dataset.angleGuide].height===+$('#height').value));
}
function renderVisualLibrary(){
  $('#focalAtlas').innerHTML=focalStops.map((f,i)=>`<button class="atlas-card focal-card" data-focal="${f}"><div class="atlas-visual anamorphic-visual" style="background-image:url('assets/previews/focals/${f}mm.png')"><i class="flare"></i><i class="bokeh"></i></div><span class="atlas-copy"><b>${f} MM · 2×</b><small>${focalLooks[i]} Анаморфотное овальное боке.</small></span></button>`).join('');
  $('#apertureAtlas').innerHTML=apertureStops.map((a,i)=>{const t=(a/10).toFixed(1),blur=Math.max(.4,5-i*.65),bokeh=Math.max(0,7-i);return `<button class="atlas-card aperture-card" data-aperture="${a}" style="--blur:${blur}px;--bokeh:${bokeh}px"><div class="atlas-visual"><i class="focus-mask"></i><span class="bokeh-row"><i></i><i></i><i></i></span></div><span class="atlas-copy"><b>T${t}</b><small>${apertureLooks[a]}</small></span></button>`}).join('');
  $('#angleAtlas').innerHTML=angleGuides.map((a,i)=>`<button class="atlas-card angle-card" data-angle-guide="${i}" data-kind="${a.kind}"><div class="angle-diagram" style="--cam-x:${a.x};--cam-y:${a.y};--cam-rot:${a.rot};--ray:${a.ray};--ray-rot:${a.rayRot}"><i class="ground"></i><i class="person"></i><i class="sightline"></i><i class="mini-camera"></i></div><span class="atlas-copy"><b>${a.name}</b><small>${a.note}</small></span></button>`).join('');
  $$('.focal-card').forEach(card=>card.addEventListener('click',()=>{$('#focal').value=card.dataset.focal;$('#anamorphic').checked=true;setPreview('focal');updateReadouts();markAtlasActive();}));
  $$('.aperture-card').forEach(card=>card.addEventListener('click',()=>{$('#aperture').value=card.dataset.aperture;$('#anamorphic').checked=true;updateReadouts();markAtlasActive();}));
  $$('.angle-card').forEach(card=>card.addEventListener('click',()=>{const guide=angleGuides[+card.dataset.angleGuide];$('#height').value=guide.height;updateReadouts();markAtlasActive();}));
  markAtlasActive();
}

function renderMovements() {
  const category=$('#movementCategory').value,q=$('#movementSearch').value.trim().toLowerCase(),current=$('#cameraMovement').value;
  const list=CAMERA_MOVEMENTS.filter(m=>(category==='all'||m.category===category)&&(!q||`${m.name} ${m.category}`.toLowerCase().includes(q)));
  $('#cameraMovement').innerHTML=list.map(m=>`<option value="${m.name}">${m.name} · ${m.category}</option>`).join('');
  if(list.some(m=>m.name===current))$('#cameraMovement').value=current; else if(list[0]) $('#cameraMovement').value=list[0].name;
  updateMovementDetail();
}
function updateMovementDetail(){const m=CAMERA_MOVEMENTS.find(x=>x.name===$('#cameraMovement').value);$('#movementDetail').innerHTML=m?`<b>${m.name}</b>${movementRule(m,'ru')}`:'Движения не найдены';buildPrompt();}
$('#movementCategory').addEventListener('change',renderMovements);
$('#movementSearch').addEventListener('input',renderMovements);
$('#cameraMovement').addEventListener('change',updateMovementDetail);

['subject','camera','lensFamily','focal','aperture','height','distance','anamorphic','photoreal','cinematic','identity','physics'].forEach(id => $(`#${id}`).addEventListener('input', updateReadouts));
['motionEnabled','motionSpeed','motionDuration'].forEach(id=>$(`#${id}`).addEventListener('input',buildPrompt));
['cameraBEnabled','cameraBShot','cameraCEnabled','cameraCShot','characterCard','locationCard'].forEach(id=>$(`#${id}`).addEventListener('input',buildPrompt));
$('#orbit').addEventListener('input', e => updateStage(+e.target.value));
$$('.quick-angles button').forEach(b => b.addEventListener('click', () => updateStage(+b.dataset.angle)));
$$('.language-toggle button').forEach(b => b.addEventListener('click', () => { state.lang = b.dataset.lang; $$('.language-toggle button').forEach(x => x.classList.toggle('active', x === b)); buildPrompt(); }));
$$('#modePicker button').forEach(b => b.addEventListener('click', () => { state.mode = b.dataset.mode; $$('#modePicker button').forEach(x => x.classList.toggle('active', x === b)); buildPrompt(); }));

let dragging = false;
function pointToAngle(e) { const r = $('#stage').getBoundingClientRect(); const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2; return Math.atan2(x,y)*180/Math.PI; }
$('#cameraMarker').addEventListener('pointerdown', e => { dragging=true; e.currentTarget.setPointerCapture(e.pointerId); });
$('#cameraMarker').addEventListener('pointermove', e => { if(dragging) updateStage(pointToAngle(e)); });
$('#cameraMarker').addEventListener('pointerup', () => dragging=false);

function showToast(text='Скопировано') { const t=$('#toast'); t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500); }
async function copy(text) { try { await navigator.clipboard.writeText(text); showToast(); } catch { showToast('Выделите и скопируйте вручную'); } }
$('#copyBtn').addEventListener('click', () => copy($('#promptOutput').textContent));
$('#copyNegative').addEventListener('click', () => copy($('#negativePrompt').value));

function loadFile(file){ if(!file?.type.startsWith('image/')) return; const reader=new FileReader();reader.onload=()=>{ $('#referenceImage').src=reader.result;$('#referenceImage').style.display='block';$('#dropCopy').style.display='none';$('#removeImage').style.display='block';};reader.readAsDataURL(file); }
$('#imageInput').addEventListener('change', e => loadFile(e.target.files[0]));
$('#dropzone').addEventListener('dragover', e => e.preventDefault());
$('#dropzone').addEventListener('drop', e => { e.preventDefault();loadFile(e.dataTransfer.files[0]); });
$('#removeImage').addEventListener('click', e => { e.preventDefault();$('#referenceImage').src='';$('#referenceImage').style.display='none';$('#dropCopy').style.display='grid';e.currentTarget.style.display='none'; });
$('#resetBtn').addEventListener('click',()=>{ $('#orbit').value=0;$('#height').value=0;$('#distance').value=2;$('#focal').value=50;$('#aperture').value=28;$('#anamorphic').checked=$('#cameraBEnabled').checked=$('#cameraCEnabled').checked=$('#characterCard').checked=$('#locationCard').checked=false;$('#photoreal').checked=$('#cinematic').checked=$('#identity').checked=$('#physics').checked=true;state.mode='angle';$$('#modePicker button').forEach(x=>x.classList.toggle('active',x.dataset.mode==='angle'));updateReadouts();updateStage(0); });
window.addEventListener('resize',()=>updateStage(state.angle));
renderVisualLibrary(); renderMovements(); updateReadouts(); updateStage(0);
