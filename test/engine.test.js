import test from "node:test";
import assert from "node:assert/strict";
import {createDefaultState,compose,normalizeImported} from "../src/engine.js";

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
