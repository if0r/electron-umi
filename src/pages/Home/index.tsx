import Guide from '@/components/Guide';
import { trim } from '@/utils/format';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import styles from './index.less';
import { useEffect, useState } from 'react';
import { Modal, Progress, Typography } from 'antd';

const { electronApi } = window as any;

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

type AutoUpdateType = { 
  hasUpdate: boolean;
  percent: number;
  total?: number;
  transferred?: number;
}

const HomePage: React.FC = () => {
  const { name } = useModel('global');
  const [autoUpdate, setAutoUpdate] = useState<AutoUpdateType>({ hasUpdate: false, percent: 0 })
  useEffect(()=> {
    electronApi?.receive("fromMain", (data: AutoUpdateType) => {
      console.warn('fromMain', data)
      setAutoUpdate(data)
    });
  },[])
  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <Guide name={trim(name)} />
      </div>
      <Modal title="自動更新" open={autoUpdate?.hasUpdate} footer={null} centered closable={false}>
        <Progress 
          percent={autoUpdate?.percent} 
          status={autoUpdate?.percent < 100 ? "active" : "success"} 
          format={percent => `${percent?.toFixed(0)}%`} 
        />
        {!!autoUpdate?.total && (
          <Typography.Text type="secondary">
            {`${formatBytes(autoUpdate?.transferred ?? 0)} / ${formatBytes(autoUpdate?.total)}`}
          </Typography.Text>
        )}
      </Modal>
    </PageContainer>
  );
};

export default HomePage;
