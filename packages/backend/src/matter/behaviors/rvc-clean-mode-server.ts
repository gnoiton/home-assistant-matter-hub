import type { HomeAssistantEntityInformation } from "@home-assistant-matter-hub/common";
import { RvcCleanModeServer as Base } from "@matter/main/behaviors";
import { ModeBase } from "@matter/main/clusters/mode-base";
import type { RvcCleanMode } from "@matter/main/clusters/rvc-clean-mode";
import { applyPatchState } from "../../utils/apply-patch-state.js";
import { HomeAssistantEntityBehavior } from "./home-assistant-entity-behavior.js";
import type { ValueGetter } from "./utils/cluster-config.js";

export enum RvcSupportedCleanMode {
  Vacuum = 0,
  VacuumAndMop = 1,
  Mop = 2,
}

export interface RvcCleanModeServerConfig {
  getCurrentMode: ValueGetter<RvcSupportedCleanMode>;
  getSupportedModes: ValueGetter<RvcCleanMode.ModeOption[]>;
}

class RvcCleanModeServerBase extends Base {
  declare state: RvcCleanModeServerBase.State;

  override async initialize() {
    const homeAssistant = await this.agent.load(HomeAssistantEntityBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
    await super.initialize();
  }

  private update(entity: HomeAssistantEntityInformation) {
    applyPatchState(this.state, {
      currentMode: this.state.config.getCurrentMode(entity.state, this.agent),
      supportedModes: this.state.config.getSupportedModes(entity.state, this.agent),
    });
  }

  override changeToMode(
    request: ModeBase.ChangeToModeRequest,
  ): ModeBase.ChangeToModeResponse {
    const homeAssistant = this.agent.get(HomeAssistantEntityBehavior);

    let modeValue: number;
    switch (request.newMode) {
      case RvcSupportedCleanMode.Vacuum:
        modeValue = 0;
        break;
      case RvcSupportedCleanMode.VacuumAndMop:
        modeValue = 1;
        break;
      case RvcSupportedCleanMode.Mop:
        modeValue = 2;
        break;
      default:
        return {
          status: ModeBase.ModeChangeStatus.Failure,
          statusText: "Unknown clean mode",
        };
    }

    homeAssistant.callAction(async () => {
      await homeAssistant.callService("xiaomi_miot.set_property", {
        entity_id: "vacuum.xiaomi_b106bk_ec7b_robot_cleaner",
        field: "vacuum.mode",
        value: modeValue,
      });
    });

    return {
      status: ModeBase.ModeChangeStatus.Success,
      statusText: "Successfully switched clean mode",
    };
  }
}

namespace RvcCleanModeServerBase {
  export class State extends Base.State {
    config!: RvcCleanModeServerConfig;
  }
}

export function RvcCleanModeServer(config: RvcCleanModeServerConfig) {
  return RvcCleanModeServerBase.set({ config });
}
