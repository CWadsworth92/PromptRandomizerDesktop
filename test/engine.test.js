import test from "node:test";
import assert from "node:assert/strict";
import {createDefaultState,compose,normalizeImported} from "../src/engine.js";
import {catalogToConfig} from "../src/catalog.js";

test("modes keep independent state",()=>{
  const state=createDefaultState();
  state.standard.seed="1"; state.explicit.seed="2";
  assert.notEqual(compose(state.standard).prompt,compose(state.explicit).prompt);
  assert.equal(state.standard.seed,"1");
});

test("same seed is deterministic",()=>{
  const data=createDefaultState().standard; data.seed="123";
  assert.equal(compose(data).prompt,compose(data).prompt);
});

test("imports preserve existing enabled state and disable new categories",()=>{
  const current={categories:[{id:"subject",enabled:true,behavior:"choose_one"}]};
  const imported={categories:[{id:"subject",enabled:false,behavior:"combine_all"},{id:"new",enabled:true}]};
  const result=normalizeImported(imported,current);
  assert.equal(result.categories[0].enabled,true);
  assert.equal(result.categories[0].behavior,"choose_one");
  assert.equal(result.categories[1].enabled,false);
});

test("recursive v6 catalogs flatten into selectable subcategories",()=>{
  const result=catalogToConfig({version:6,categories:[{id:"master",name:"Master",kind:"group",children:[{id:"leaf",name:"Leaf",kind:"leaf",state:"off",presets:[{id:"p",label:"Preset",prompt:"natural prose"}]}]}]});
  assert.equal(result.categories[0].name,"Master › Leaf");
  assert.equal(result.categories[0].options[0].text,"natural prose");
});

test("choose several adds the requested number of options",()=>{
  const data={seed:"44",lora:false,loraTrigger:"",config:{categories:[{id:"c",enabled:true,chance:100,order:0,behavior:"choose_n",chooseCount:2,options:[{text:"one"},{text:"two"},{text:"three"}]}]}};
  assert.equal(compose(data).count,2);
});
