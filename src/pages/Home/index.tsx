import Guide from '@/components/Guide';
import { trim } from '@/utils/format';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import styles from './index.less';
import { useEffect, useState } from 'react';
import { Spin } from 'antd';

const { electronApi } = window as any;


const HomePage: React.FC = () => {
  const { name } = useModel('global');
  const [isUpdating, setIsUpdating] = useState(false)
  useEffect(()=> {
    electronApi.receive("fromMain", (data: boolean) => {
      console.warn('fromMain', data)
      setIsUpdating(data)
    });  
    // electronApi.send("toMain", "some data");
  },[])
  return (
    <Spin spinning={isUpdating} tip="有更新 自動更新下載中">
    <PageContainer ghost>
      <div className={styles.container}>
        <Guide name={trim(name)} />
      </div>
    </PageContainer>
    </Spin>
  );
};

export default HomePage;
