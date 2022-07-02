import {App, Component, ComponentPublicInstance, createApp, h} from 'vue'
import { Pen,setElemPosition,register } from '@topology/core'

type ComponentInstanceFNParams={
  componentName:string
  id:string
}

type AddComponentInstanceFNParams = ComponentInstanceFNParams & {
  wrapper:HTMLElement
  instance:ComponentPublicInstance
  app:App<Element>
}

class ComponentInstanceList{
  private componentInstanceList:{
    [componentName:string]:{
      [key:string]:{
        wrapper:HTMLElement
        instance:ComponentPublicInstance
        app:App<Element>
      }
    }
  }={}

  addComponentList(componentName:string){
    this.componentInstanceList[componentName]={}
  }

  removeComponentList(componentName:string){
    delete this.componentInstanceList[componentName]
  }

  getComponentList(componentName:string){
    return this.componentInstanceList[componentName]
  }

  addComponentInstance({componentName,id,wrapper,instance,app}:AddComponentInstanceFNParams){
    const componentList=this.getComponentList(componentName)
    componentList[id]={
      wrapper,
      instance,
      app
    }
  }

  removeComponentInstance({componentName,id}:ComponentInstanceFNParams){
    const componentInstance=this.getComponentList(componentName)[id]
    componentInstance.wrapper.remove()
    componentInstance.app.unmount()
    delete this.getComponentList(componentName)[id]
  }

  getComponentInstance({componentName,id}:ComponentInstanceFNParams){
    const componentList=this.getComponentList(componentName)
    return componentList[id]
  }
}


const componentInstanceList=new ComponentInstanceList()

const topologyComponents:{
  [key:string]:(pen:Pen)=>Path2D
}={}

type EventsKeys='onValue'|'onMove '|'onResize'|'onRotate '|'onClick '|'onMouseDown '|'onMouseMove '|'onMouseUp '|'onMouseEnter '|'onMouseLeave '|'onShowInput'|'onInput'|'onChangeId'

const createTopologyComponent=(componentName:string,component:Component)=>{
  const render=(pen:Pen)=>{
    console.log('render');
    const wrapper=document.createElement('div')
    const app=createApp(component)
    const instance= app.mount(wrapper)
    pen?.calculative?.canvas.externalElements.appendChild(wrapper)
    setElemPosition(pen,wrapper)
    componentInstanceList.addComponentInstance({
      componentName,
      id:pen.id,
      wrapper, 
      instance,
      app
    })
  }
  return (pen:Pen)=>{
    const path=new Path2D()
    if(pen.onDestroy){
    }
    const {id}=pen

    // 初始化组件
    if(!componentInstanceList.getComponentInstance({
      componentName,
      id
    })&&pen?.calculative?.canvas.externalElements.appendChild){
      render(pen)
    }

    return path
  }
}

export const registerVueComponents=(vueComponents:{
  [componentName:string]:Component 
})=>{
  Object.keys(vueComponents).forEach((componentName)=>{
    if(!componentInstanceList.getComponentList(componentName)) componentInstanceList.addComponentList(componentName)
    topologyComponents[componentName]=createTopologyComponent(componentName,vueComponents[componentName])
  })

  register(topologyComponents)
}