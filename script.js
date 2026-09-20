const videos = [
  {id:"sports", emoji:"⚽", title:"スポーツのスーパープレー", desc:"サッカー・野球など", tags:["スポーツ"], base:78},
  {id:"cat", emoji:"🐱", title:"かわいい猫の動画", desc:"動物・癒やし系", tags:["動物","癒やし"], base:76},
  {id:"science", emoji:"🔬", title:"3分で分かる科学", desc:"科学・実験・宇宙", tags:["科学","学習"], base:72},
  {id:"game", emoji:"🎮", title:"ゲーム実況ハイライト", desc:"ゲーム・実況", tags:["ゲーム"], base:74},
  {id:"music", emoji:"🎵", title:"音楽ランキング", desc:"音楽・ライブ", tags:["音楽"], base:70},
  {id:"food", emoji:"🍳", title:"簡単料理チャレンジ", desc:"料理・レシピ", tags:["料理","生活"], base:69},
  {id:"travel", emoji:"✈️", title:"絶景をめぐる旅", desc:"旅行・観光", tags:["旅行"], base:68},
  {id:"tech", emoji:"💻", title:"AI・コンピュータ入門", desc:"IT・テクノロジー", tags:["IT","学習"], base:67},
  {id:"craft", emoji:"🧩", title:"ものづくりのアイデア", desc:"工作・DIY", tags:["工作","生活"], base:65}
];

let behavior = {};
let ipShown = false;

function renderVideos(){
  const grid = document.getElementById("videoGrid");
  grid.innerHTML = videos.map(v => `
    <article class="video">
      <div class="thumb">${v.emoji}</div>
      <div class="video-body">
        <h3>${v.title}</h3>
        <p>${v.desc}</p>
        <div class="actions">
          <button onclick="watch('${v.id}')">▶ 視聴</button>
          <button onclick="finish('${v.id}')">✓ 最後まで</button>
          <button onclick="like('${v.id}')">♥ いいね</button>
        </div>
      </div>
    </article>`).join("");
}

function addBehavior(id,type,points){
  if(!behavior[id]) behavior[id] = {watch:0,finish:0,like:0};
  behavior[id][type]++;
  behavior[id].score = (behavior[id].watch||0)*10 + (behavior[id].finish||0)*25 + (behavior[id].like||0)*18;
  updateScore();
  updateLog();
}

window.watch = id => addBehavior(id,"watch",10);
window.finish = id => addBehavior(id,"finish",25);
window.like = id => {
  addBehavior(id,"like",18);
  event.target.classList.add("liked");
};

function updateScore(){
  const total = Object.values(behavior).reduce((s,x)=>s+(x.score||0),0);
  document.getElementById("totalScore").textContent = total;
}
function updateLog(){
  const items = Object.entries(behavior).filter(([,x])=>x.score>0);
  document.getElementById("dataLog").innerHTML = items.length
    ? items.map(([id,x]) => {
        const v=videos.find(z=>z.id===id);
        return `<b>${v.emoji} ${v.title}</b>：視聴 ${x.watch||0}回 / 最後まで ${x.finish||0}回 / いいね ${x.like||0}回`;
      }).join("<br>")
    : "まだ行動データはありません。";
}

document.getElementById("ipButton").addEventListener("click",()=>{
  ipShown=true;
  document.getElementById("ipResult").classList.remove("hidden");
  // 教材用の疑似IP。実際の利用者のIPは取得・保存しません。
  const fake = `192.168.${Math.floor(Math.random()*20)+1}.${Math.floor(Math.random()*200)+20}`;
  document.getElementById("ipAddress").textContent=fake;
  document.getElementById("networkText").textContent = "この教材では「ネットワークの住所」を疑似表示";
});

document.getElementById("recommendButton").addEventListener("click",()=>{
  const ranked = videos.map(v=>{
    let score=v.base;
    const own=behavior[v.id];
    if(own) score += own.score*1.2;
    const tags=v.tags;
    // 「似た動画」を好んだ行動からジャンルの重みを伝播させる簡易モデル
    for(const [id,b] of Object.entries(behavior)){
      if((b.score||0)===0) continue;
      const watched=videos.find(x=>x.id===id);
      const overlap=tags.filter(t=>watched.tags.includes(t)).length;
      score += overlap * (b.score*0.55);
    }
    // 少しだけ「未視聴」を発見候補にする
    if(!own) score += 5;
    return {...v,score};
  }).sort((a,b)=>b.score-a.score).slice(0,5);

  document.getElementById("recommendResult").innerHTML =
    ranked.map((v,i)=>`
      <div class="recommend-card">
        <div class="rank">${i+1}</div>
        <div class="rec-emoji">${v.emoji}</div>
        <div class="rec-info"><h3>${v.title}</h3><p>${v.desc}　｜　AI風スコア ${Math.round(v.score)}</p></div>
        <div class="score">おすすめ</div>
      </div>`).join("");
});

document.getElementById("resetButton").addEventListener("click",()=>{
  behavior={}; updateScore(); updateLog();
  document.getElementById("recommendResult").innerHTML='<div class="empty">STEP 2で動画を選ぶと、あなた向けのおすすめが表示されます。</div>';
  document.querySelectorAll(".actions button").forEach(b=>b.classList.remove("liked"));
});

renderVideos();
