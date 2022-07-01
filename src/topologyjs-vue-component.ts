import {Component, ComponentPublicInstance, createApp} from 'vue'
import { Pen,setElemPosition,register } from '@topology/core'

type ComponentInstanceFNParams={
  componentName:string
  id:string
}

type AddComponentInstanceFNParams = ComponentInstanceFNParams & {
  wrapper:HTMLElement
  instance:ComponentPublicInstance
}

class ComponentInstanceList{
  private componentInstanceList:{
    [componentName:string]:{
      [key:string]:{
        wrapper:HTMLElement
        instance:ComponentPublicInstance
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

  addComponentInstance({componentName,id,wrapper,instance}:AddComponentInstanceFNParams){
    const componentList=this.getComponentList(componentName)
    componentList[id]={
      wrapper,
      instance
    }
  }

  removeComponentInstance({componentName,id}:ComponentInstanceFNParams){
    const componentList=this.getComponentList(componentName)
    delete componentList[id]
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

const createTopologyComponent=(componentName:string,component:Component)=>{
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
      const wrapper=document.createElement('div')
      const instance=createApp(component).mount(wrapper)
      pen?.calculative?.canvas.externalElements.appendChild(wrapper)
      setElemPosition(pen,wrapper)
      componentInstanceList.addComponentInstance({
        componentName,
        id,
        wrapper,
        instance
      })
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