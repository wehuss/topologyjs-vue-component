import { App, Component, ComponentPublicInstance, createApp, h } from "vue";
import { setElemPosition, register } from "@topology/core";
import { VuePen } from "./vue-pen";

type ComponentInstanceFNParams = {
  id: string;
};

type AddComponentInstanceFNParams = ComponentInstanceFNParams & {
  wrapper: HTMLElement;
  instance: CustomVueComponent;
  app: App<Element>;
};

interface CustomVueComponent extends ComponentPublicInstance{
  penEvents?:VuePenEvents
}

class ComponentInstanceList {
  private componentInstanceList: {
    [penId: string]: {
      wrapper: HTMLElement;
      instance: CustomVueComponent;
      app: App<Element>;
    };
  } = {};

  addComponentInstance({
    id,
    wrapper,
    instance,
    app,
  }: AddComponentInstanceFNParams) {
    // const componentList = this.getComponentList(componentName);
    this.componentInstanceList[id] = {
      wrapper,
      instance,
      app,
    };
  }

  removeComponentInstance({ id }: ComponentInstanceFNParams) {
    const componentInstance = this.componentInstanceList[id];
    componentInstance.wrapper.remove();
    componentInstance.app.unmount();
    delete this.componentInstanceList[id];
  }

  getComponentInstance({ id }: ComponentInstanceFNParams) {
    // console.log('this.componentInstanceList',id,this.componentInstanceList);
    let _id: string = id;
    if (id.includes("moving")) {
      _id = _id.split("-")[0];
    }
    // const componentList = this.getComponentList(componentName);
    return this.componentInstanceList[_id];
  }
}

const componentInstanceList = new ComponentInstanceList();

const topologyComponents: {
  [key: string]: (pen: VuePen) => Path2D;
} = {};

type EventsKeys =
  | "onValue"
  | "onDestroy"
  | "onMove"
  | "onResize"
  | "onRotate"
  | "onClick"
  | "onMouseDown"
  | "onMouseMove"
  | "onMouseUp"
  | "onMouseEnter"
  | "onMouseLeave"
  | "onShowInput"
  | "onInput"
  | "onChangeId";

type PenEvents = {
  [key in EventsKeys]?: (params: PenEventParams) => any;
};

type PenEventParams=AddComponentInstanceFNParams

export type VuePenEvents= {
  [key in EventsKeys]?: (pen:VuePen) => any;
}

const triggerInstanceEvents=(pen:VuePen,instance:CustomVueComponent,event:EventsKeys)=>{
  if(instance.penEvents&&typeof instance.penEvents[event]==='function'){
    instance.penEvents[event](pen)
  }
}

const penEvents: PenEvents = {
  onMove({ wrapper,instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onMove')
      setElemPosition(pen, wrapper);
    };
  },
  onDestroy({ id, instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onDestroy')
      componentInstanceList.removeComponentInstance({ id });
    };
  },
  onValue({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onValue')
    };
  },
  onChangeId({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onChangeId')
    };
  },
  onClick({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onClick')
    };
  },
  onInput({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onInput')
    };
  },
  onMouseDown({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onMouseDown')
    };
  },
  onMouseEnter({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onMouseEnter')
    };
  },
  onMouseLeave({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onMouseLeave')
    };
  },
  onMouseMove({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onMouseMove')
    };
  },
  onMouseUp({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onMouseUp')
    };
  },
  onResize({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onResize')
    };
  },
  onRotate({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onRotate')
    };
  },
  onShowInput({ instance }: PenEventParams) {
    return (pen: VuePen) => {
      triggerInstanceEvents(pen,instance,'onShowInput')
    };
  },
};

const createTopologyComponent = (
  component: Component
) => {
  const render = (pen: VuePen) => {
    console.log("render!!!!");
    const wrapper = document.createElement("div");
    const app = createApp(
      h(component as any, {
        pen,
      })
    );
    const instance = app.mount(wrapper);
    pen?.calculative?.canvas.externalElements.appendChild(wrapper);
    setElemPosition(pen, wrapper);
    componentInstanceList.addComponentInstance({
      id: pen.id,
      wrapper,
      instance,
      app,
    });
  };
  return (pen: VuePen) => {
    const { id } = pen;
    const path = new Path2D();
    // 初始化组件
    if (pen?.calculative?.canvas.externalElements.appendChild) {
      if (!pen.rendered) {
        render(pen);
        pen.rendered = true;
      } else if (!id.includes("-moving")) {
        // 更新props
        const {
          app: { _instance },
        } = componentInstanceList.getComponentInstance({
          id,
        });
        if (Object.hasOwn(_instance.type.props, "pen")) {
          _instance.props.pen = pen;
          _instance.update();
        }
      }
    }

    if (!pen.onDestroy) {
      const instance=componentInstanceList.getComponentInstance({id})
      Object.keys(penEvents).forEach((key) => {
        pen[key] = penEvents[key]({
          ...instance,
          id,
        });
      });
    }

    return path;
  };
};

export const registerVueComponents = (vueComponents: {
  [componentName: string]: Component;
}) => {
  Object.keys(vueComponents).forEach((componentName) => {
    topologyComponents[componentName] = createTopologyComponent(
      vueComponents[componentName]
    );
  });

  register(topologyComponents);
};
