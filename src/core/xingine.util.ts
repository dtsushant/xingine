import {Renderer, UIComponent, UIComponentDetail} from "./xingine.type";

export function isRenderer(component: UIComponent): component is Renderer {
    return 'componentDetail' in component;
}

export function isUIComponentDetail(component: UIComponent): component is UIComponentDetail {
    return 'component' in component && !('componentDetail' in component);
}

export function getRenderer(component: UIComponent): Renderer | null {
    return isRenderer(component) ? component : null;
}

export function getUIComponentDetail(component: UIComponent): UIComponentDetail | null {
    return isUIComponentDetail(component) ? component : null;
}

export function getUIComponentDetails(component:UIComponent[]):UIComponentDetail[]{
    return component.filter(isUIComponentDetail) as UIComponentDetail[];
}

export  function getRenderers(component:UIComponent[]):Renderer[]{
    return component.filter(isRenderer) as Renderer[];
}