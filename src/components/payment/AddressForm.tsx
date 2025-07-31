import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "./AddressForm.css";

// zod 스키마 정의
const schema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  phonePrefix: z.enum(["010", "011", "016", "017", "018", "019"]),
  phonePart1: z.string().regex(/^\d{3,4}$/, "3~4자리 숫자"),
  phonePart2: z.string().regex(/^\d{4}$/, "4자리 숫자"),
  address1: z.string().min(1, "주소를 입력해 주세요."),
  address2: z.string().min(1, "상세 주소를 입력해 주세요."),
});

type AddressFormInputs = z.infer<typeof schema>;

const dummyDefault: AddressFormInputs = {
  name: "홍길동",
  phonePrefix: "010",
  phonePart1: "1234",
  phonePart2: "5678",
  address1: "서울시 강남구",
  address2: "역삼동 123-45",
};

const AddressForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormInputs>({ resolver: zodResolver(schema) });

  const [defaultAddress] = useState(dummyDefault);
  const [recentAddresses, setRecentAddresses] = useState<AddressFormInputs[]>([]);
  const [showRecentList, setShowRecentList] = useState(false);

  const onSubmit = (data: AddressFormInputs) => {
    const exists = recentAddresses.some(
      (addr) => JSON.stringify(addr) === JSON.stringify(data)
    );
    if (!exists) {
      setRecentAddresses((prev) => [data, ...prev.slice(0, 4)]);
    }
    alert("배송지 저장 완료!");
  };

  return (
    <form className="address-container" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="section-title">배송지 정보</h2>

      <div className="address-tabs">
        <span className="label">배송지 선택</span>
        <button type="button" onClick={() => reset(defaultAddress)}>
          <span className="dot" /> 기본
        </button>
        <button type="button" onClick={() => setShowRecentList((prev) => !prev)}>
          <span className="dot" /> 최근
        </button>
        <button type="button">배송지 관리</button>
      </div>

      {showRecentList && (
        <ul className="recent-list">
          {recentAddresses.length === 0 && <li>최근 배송지가 없습니다.</li>}
          {recentAddresses.map((addr, idx) => (
            <li key={idx} onClick={() => reset(addr)}>
              {addr.name} / {addr.phonePrefix}-{addr.phonePart1}-{addr.phonePart2} /{" "}
              {addr.address1}
            </li>
          ))}
        </ul>
      )}

      <div className="address-form-grid">
        <div className="left-section">
          <label>받는 사람 *</label>
          <input type="text" {...register("name")} />
          {errors.name && <p className="error">{errors.name.message}</p>}

          <label>연락처 *</label>
          <div className="phone-inputs">
            <select {...register("phonePrefix")}>
              <option value="010">010</option>
              <option value="011">011</option>
              <option value="016">016</option>
              <option value="017">017</option>
              <option value="018">018</option>
              <option value="019">019</option>
            </select>
            <input type="text" maxLength={4} {...register("phonePart1")} />
            <input type="text" maxLength={4} {...register("phonePart2")} />
          </div>
          {(errors.phonePart1 || errors.phonePart2) && (
            <p className="error">
              {errors.phonePart1?.message || errors.phonePart2?.message}
            </p>
          )}
        </div>

        <div className="right-section">
          <label>주소 *</label>
          <div className="address-row">
            <input type="text" {...register("address1")} />
            <button type="button" onClick={() => alert("주소 검색 미구현")}>
              주소 검색
            </button>
          </div>
          {errors.address1 && <p className="error">{errors.address1.message}</p>}

          <input type="text" placeholder="상세 주소" {...register("address2")} />
          {errors.address2 && <p className="error">{errors.address2.message}</p>}
        </div>
      </div>

      <div className="submit-wrap">
        <button type="submit">저장</button>
      </div>
    </form>
  );
};

export default AddressForm;
