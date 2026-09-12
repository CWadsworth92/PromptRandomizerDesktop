function walk(node, path, output) {
  const nextPath = [...path, node.name].filter(Boolean);
  if (node.kind === "leaf" || Array.isArray(node.presets)) {
    output.push({
      id: node.id,
      name: nextPath.join(" › "),
      enabled: node.state === "on",
      behavior: Number(node.pick_count || 1) > 1 ? "choose_n" : "choose_one",
      chooseCount: Number(node.pick_count || 1),
      chance: Number(node.chance ?? 100),
      order: output.length,
      options: (node.presets || []).map(preset => ({ id: preset.id, name: preset.label, text: preset.prompt, enabled: preset.random_pool !== false }))
    });
    return;
  }
  for (const child of node.children || []) walk(child, nextPath, output);
}

export function catalogToConfig(catalog) {
  if (!catalog || !Array.isArray(catalog.categories)) throw new Error("Catalog is missing its categories array.");
  if (catalog.categories.every(category => Array.isArray(category.options))) return catalog;
  const categories = [];
  for (const master of catalog.categories) walk(master, [], categories);
  return { version: catalog.version, profile: catalog.prompt_profile || catalog.profile || "krea2_natural", categories };
}
