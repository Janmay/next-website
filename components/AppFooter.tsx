import React from 'react';
import Layout from './Layout';
import { Row, Col } from './grid';

const { Footer } = Layout;

export default class AppFooter extends React.Component<{}, {}> {
  render() {
    const links = [
      { name: '国家食药监局', link: 'http://www.sda.gov.cn/WS01/CL0001/' },
      { name: '中国物品编码中心', link: 'http://www.ancc.org.cn/' },
      { name: '农业部', link: 'http://www.moa.gov.cn/' },
      { name: '中国消费者协会', link: 'http://www.cca.org.cn/' },
      { name: '工商总局', link: 'http://www.saic.gov.cn/' },
      { name: '中国电子商务协会', link: 'http://www.ec.org.cn/' },
      { name: '中国食品安全网', link: 'http://www.cfsn.cn/' },
    ];
    return (
      <Footer>
        <Row type="flex" justify="center" gutter={16}>
          <Col>
            <Row type="flex">
              <Col>友情链接：</Col>
              <Col>
                <Row type="flex">
                  {links.map((l, index) => (
                    <Col key={`link-${index}`}>
                      <a href={l.link} target="_blank">{l.name}</a>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
            <Row type="flex">
              <Col>版权所有：</Col>
              <Col>
                <Row type="flex">
                  <Col>四川泰丰伏羲科技有限公司</Col>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col style={{ width: '100px' }}>
            <img src="http://www.szt315.com/image/common/code_2.png" alt="泰丰伏羲" />
          </Col>
        </Row>
      </Footer>
    );
  }
}