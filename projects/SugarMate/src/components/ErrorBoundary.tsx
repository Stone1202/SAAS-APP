import React from 'react';
import { Button, Result } from 'antd';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] 捕获到渲染错误:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const errorMsg = this.state.error?.message || '未知错误';

      // 常见错误的友好提示
      const friendlyMessages: Record<string, string> = {
        'Cannot read properties of null': '数据加载异常，请刷新页面后重试',
        'undefined is not an object': '页面数据异常，请返回列表重新进入',
        'objects are not valid as a React child': '渲染数据格式异常，请刷新页面',
      };

      let friendlyMsg =
        '页面发生了意外错误，请尝试以下操作：';
      for (const [key, msg] of Object.entries(friendlyMessages)) {
        if (errorMsg.includes(key)) {
          friendlyMsg = msg;
          break;
        }
      }

      return (
        <Result
          status="error"
          title="页面出错了"
          subTitle={friendlyMsg}
          extra={[
            <Button type="primary" key="retry" onClick={this.handleReset}>
              重试
            </Button>,
            <Button key="refresh" onClick={() => window.location.reload()}>
              刷新页面
            </Button>,
            <Button
              key="back"
              onClick={() => {
                window.history.back();
                setTimeout(() => this.handleReset(), 500);
              }}
            >
              返回上一页
            </Button>,
          ]}
        >
          <details style={{ maxWidth: 500, margin: '16px auto', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: '#999' }}>错误详情</summary>
            <pre style={{ fontSize: 11, color: '#666', whiteSpace: 'pre-wrap', marginTop: 8 }}>
              {errorMsg}
              {this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}
            </pre>
          </details>
        </Result>
      );
    }
    return this.props.children;
  }
}
