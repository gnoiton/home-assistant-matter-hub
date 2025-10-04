import {
  VacuumDeviceFeature,
  VacuumCleanMode,
} from "@home-assistant-matter-hub/common";
import { RvcCleanMode } from "@matter/main/clusters";
import { testBit } from "../../../../../utils/test-bit.js";
import { HomeAssistantEntityBehavior } from "../../../../behaviors/home-assistant-entity-behavior.js";
import {
  RvcCleanModeServer,
  RvcSupportedCleanMode,
} from "../../../../behaviors/rvc-clean-mode-server.js";

export const VacuumRvcCleanModeServer = RvcCleanModeServer({
  getCurrentMode: (entity) => {
  // On récupère l'attribut "vacuum.mode" ou "mode" de l'entité
  const attrs = entity.state.attributes ?? {};
  const current = Number(attrs["vacuum.mode"] ?? attrs.mode);

  // On choisit le mode Matter correspondant
  switch (current) {
    case VacuumCleanMode.Vacuum:
      return RvcSupportedCleanMode.Vacuum;
    case VacuumCleanMode.VacuumAndMop:
      return RvcSupportedCleanMode.VacuumAndMop;
    case VacuumCleanMode.Mop:
      return RvcSupportedCleanMode.Mop;
    default:
      // si la valeur n'existe pas ou est inconnue → on met Vacuum par défaut
      return RvcSupportedCleanMode.Vacuum;
  }
},
getSupportedModes: () => [
  {
    label: "Vacuum",
    mode: RvcSupportedCleanMode.Vacuum,
    modeTags: [{ value: RvcCleanMode.ModeTag.Vacuum }],
  },
  {
    label: "Vacuum and Mop",
    mode: RvcSupportedCleanMode.VacuumAndMop,
    modeTags: [
      { value: RvcCleanMode.ModeTag.Vacuum },
      { value: RvcCleanMode.ModeTag.Mop },
    ],
  },
  {
    label: "Mop",
    mode: RvcSupportedCleanMode.Mop,
    modeTags: [{ value: RvcCleanMode.ModeTag.Mop }],
  },
],

});
