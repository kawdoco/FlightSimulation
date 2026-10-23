import { Component } from 'react';
export default class ErrorBoundary extends Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error,info){console.error('Workspace render failed',error,info);}
 render(){return this.state.failed ? <main style={{padding:40,background:'#152430',color:'#eef6ff',minHeight:'100vh'}}><h1>Unable to display the workspace</h1><p>Reload to load the latest application files.</p><button onClick={()=>window.location.reload()}>Reload application</button></main> : this.props.children;}
}
