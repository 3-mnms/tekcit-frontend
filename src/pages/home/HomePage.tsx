import Button from '@components/common/Button';

export default function HomePage() {
  return (
    <div>
      <h1>홈페이지에용🐥</h1>
      <Button variant="primary">등록하기</Button>
      <Button variant="danger">삭제하기</Button>
      <Button variant="cancel">취소하기</Button>
      <Button variant="secondary">저장하기</Button>
      <Button className="w-full h-12">로그인</Button>
    </div>
  );
}
