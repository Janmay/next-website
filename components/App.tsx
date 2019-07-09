import React from 'react';
import Layout from './Layout';
import AppFooter from './AppFooter';

const { Content } = Layout;

const App = ({ children }) => {
  return (
    <Layout>
      <Content>
        {children}
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default App;