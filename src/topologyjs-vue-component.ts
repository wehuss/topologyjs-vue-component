import { App, Component, ComponentPublicInstance, createApp, h } from "vue";
import { setElemPosition, register } from "@topology/core";
import { VuePen } from "./vue-pen";

type ComponentInstanceFNParams = {
  id: string;
};

type AddComponentInstanceFNParams = ComponentInstanceFNParams & {
  wrapper: HTMLElement;
  instance: ComponentPublicInstance;
  app: App<Element>;
};

class ComponentInstanceList {
  private componentInstanceList: {
    [penId: string]: {
      wrapper: HTMLElement;
      instance: ComponentPublicInstance;
      app: App<Element>;
    };
  } = {};

  // addComponentList(componentName: string) {
  //   this.componentInstanceList[componentName] = {};
  // }

  // removeComponentList(componentName: string) {
  //   delete this.componentInstanceList[componentName];
  // }

  // getComponentList(componentName: string) {
  //   return this.componentInstanceList[componentName];
  // }

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
  [key in EventsKeys]?: (params: ComponentInstanceFNParams) => any;
};

const penEvents: PenEvents = {
  onMove({ id }: ComponentInstanceFNParams) {
    const { wrapper, instance } = componentInstanceList.getComponentInstance({
      id,
    });
    return (pen: VuePen) => {
      setElemPosition(pen, wrapper);
    };
  },
  onDestroy({ id }: ComponentInstanceFNParams) {
    console.log('????!');
    return (pen:VuePen)=>{
      componentInstanceList.removeComponentInstance({id})
    }
  },
};

const createTopologyComponent = (
  componentName: string,
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
        const { app } = componentInstanceList.getComponentInstance({
          id,
        });
        app._instance.props.pen = pen;
        app._instance.update();
      }
    }

    if (!pen.onDestroy) {
      Object.keys(penEvents).forEach((key) => {
        pen[key] = penEvents[key]({
          componentName,
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
      componentName,
      vueComponents[componentName]
    );
  });

  register(topologyComponents);
};
