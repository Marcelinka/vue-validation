<template>
  <div @keydown.enter="onSubmitClick">
    <h1 class="auth-common-title">
      Проверка личных данных
    </h1>

    <div class="auth-common-wrapper">

      <ha-input-component
        class="auth-input"
        type="text"
        ref="lastNameInput"
        title="Фамилия"
        :focus-mount="true"
        :required="true"
        :force-error="form.errors.has('lastName')"
        :error-message="form.errors.get('lastName')"
        v-model="form.data.lastName"
        @input="form.getErrorsForField('lastName')"
      />

      <ha-input-component
        class="auth-input"
        type="text"
        title="Имя"
        :required="true"
        :force-error="form.errors.has('firstName')"
        :error-message="form.errors.get('firstName')"
        v-model="form.data.firstName"
        @input="form.getErrorsForField('firstName')"
      />

      <ha-input-component
        class="auth-input"
        name="middleName"
        type="text"
        title="Отчество"
        :force-error="form.errors.has('middleName')"
        :error-message="form.errors.get('middleName')"
        v-model="form.data.middleName"
        @input="form.getErrorsForField('middleName')"
      />

      <p class="input-label">Дата рождения <span class="asterisk">*</span></p>
      <date-input-component
        ref="birthday"
        :force-validation="form.errors.has('birthday')"
        :error-message="form.errors.get('birthday')"
        v-model="form.data.birthday"
        @input="form.getErrorsForField('birthday')"
        @after-select-year="$refs.email.focus()"
        :mobile-width="768"
      />

      <ha-input-component
        class="auth-input auth-input_email"
        name="email"
        ref="email"
        type="email"
        title="Email"
        :force-error="form.errors.has('email')"
        :error-message="form.errors.get('email')"
        v-model="form.data.email"
        @input="form.getErrorsForField('email')"
      />

      <ha-button-component class="auth-button" @click="onSubmitClick">
        Далее
      </ha-button-component>

      <!-- Form footer -->
      <auth-form-footer />

      <!-- Spinner -->
      <ha-spinner-component :visible="spinnerVisible" />
    </div>
  </div>
</template>

<script lang="ts">
// Vue
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Action } from 'vuex-class';
// Services
import { Endpoints } from '@/core/endpoints';
import Form from '@/core/form/form';
import { AuthStateModuleNamespace } from '@/core/store.namespace';
// Components
import HaButtonComponent from '@/vendor/hyperauto-ui/src/components/ButtonComponent.vue';
import HaSpinnerComponent from '@/vendor/hyperauto-ui/src/components/SpinnerComponent.vue';
import HaLinkComponent from '@/vendor/hyperauto-ui/src/components/LinkComponent.vue';
import HaInputComponent from '@/vendor/hyperauto-ui/src/components/InputComponent.vue';
import HaSelectComponent from '@/vendor/hyperauto-ui/src/components/SelectComponent.vue';
import DateInputComponent from '@/core/components/DateInputComponent.vue';
import AuthFormFooter from './AuthFooterComponent.vue';

@Component({
  components: {
    DateInputComponent,
    HaButtonComponent,
    HaSpinnerComponent,
    HaLinkComponent,
    HaInputComponent,
    HaSelectComponent,
    AuthFormFooter,
  },
})
export default class PersonalDataComponent extends Vue {
  @Prop({ default: true })
  public withTitle!: boolean;

  @Action('validateProfile', { namespace: AuthStateModuleNamespace })
  public validateProfile: any;

  public spinnerVisible: boolean = false;

  public form = new Form(
    {
      firstName: '',
      middleName: '',
      lastName: '',
      birthday: '',
      email: '',
    },
    [
      {
        fieldName: 'firstName',
        isValid: this.$validators.notEmptyString,
        message: 'wrongField',
      },
      {
        fieldName: 'lastName',
        isValid: this.$validators.notEmptyString,
        message: 'wrongField',
      },
      {
        fieldName: 'birthday',
        isValid: this.$validators.notEmptyString,
        message: 'fieldsNotFilled',
      },
      {
        fieldName: 'birthday',
        isValid: this.$validators.ageNoLessEighteen,
        message: 'minimumAge',
      },
      {
        fieldName: 'email',
        isValid: this.$validators.email,
        message: 'wrongField',
      },
    ],
  );

  /**
   * Submit input
   */
  public onSubmitClick(): void {
    // Submit personal data
    if (!this.form.isValid()) {
      return;
    }

    this.spinnerVisible = true;

    this.form.send(
      this.validateProfile(this.form.data)
        .finally(() => {
          this.spinnerVisible = false;
        }),
    );
  }
}
</script>

<style lang="less" scoped>

.auth-common-wrapper {
  .auth-common-hint {
    margin-top: 10px;
  }

  .input-label {
    font-size: 13px;
    line-height: 16px;
    color: #666;
    margin-top: 28px;
    margin-bottom: 6px;
  }

  .asterisk {
    color: red;
  }
}

.auth-common-wrapper .auth-input_email {
  margin-top: 0;
  margin-bottom: 30px;
}
</style>
