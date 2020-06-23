'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">angular-odata documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/ODataModule.html" data-type="entity-link">ODataModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ODataModule-a410c437ef6e02b2fb017ab98948ab06"' : 'data-target="#xs-injectables-links-module-ODataModule-a410c437ef6e02b2fb017ab98948ab06"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ODataModule-a410c437ef6e02b2fb017ab98948ab06"' :
                                        'id="xs-injectables-links-module-ODataModule-a410c437ef6e02b2fb017ab98948ab06"' }>
                                        <li class="link">
                                            <a href="injectables/ODataClient.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ODataClient</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ODataServiceFactory.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>ODataServiceFactory</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/BatchRequest.html" data-type="entity-link">BatchRequest</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlAction.html" data-type="entity-link">CsdlAction</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlActionImport.html" data-type="entity-link">CsdlActionImport</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlAnnotable.html" data-type="entity-link">CsdlAnnotable</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlAnnotation.html" data-type="entity-link">CsdlAnnotation</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlAnnotations.html" data-type="entity-link">CsdlAnnotations</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlComplexType.html" data-type="entity-link">CsdlComplexType</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlEntityContainer.html" data-type="entity-link">CsdlEntityContainer</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlEntitySet.html" data-type="entity-link">CsdlEntitySet</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlEntityType.html" data-type="entity-link">CsdlEntityType</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlEnumMember.html" data-type="entity-link">CsdlEnumMember</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlEnumType.html" data-type="entity-link">CsdlEnumType</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlFunction.html" data-type="entity-link">CsdlFunction</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlFunctionImport.html" data-type="entity-link">CsdlFunctionImport</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlInclude.html" data-type="entity-link">CsdlInclude</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlIncludeAnnotations.html" data-type="entity-link">CsdlIncludeAnnotations</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlKey.html" data-type="entity-link">CsdlKey</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlNavigationProperty.html" data-type="entity-link">CsdlNavigationProperty</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlNavigationPropertyBinding.html" data-type="entity-link">CsdlNavigationPropertyBinding</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlOnDelete.html" data-type="entity-link">CsdlOnDelete</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlParameter.html" data-type="entity-link">CsdlParameter</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlProperty.html" data-type="entity-link">CsdlProperty</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlPropertyRef.html" data-type="entity-link">CsdlPropertyRef</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlReference.html" data-type="entity-link">CsdlReference</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlReferentialConstraint.html" data-type="entity-link">CsdlReferentialConstraint</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlReturnType.html" data-type="entity-link">CsdlReturnType</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlSchema.html" data-type="entity-link">CsdlSchema</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlSingleton.html" data-type="entity-link">CsdlSingleton</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlStructuralProperty.html" data-type="entity-link">CsdlStructuralProperty</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlStructuredType.html" data-type="entity-link">CsdlStructuredType</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlTerm.html" data-type="entity-link">CsdlTerm</a>
                            </li>
                            <li class="link">
                                <a href="classes/CsdlTypeDefinition.html" data-type="entity-link">CsdlTypeDefinition</a>
                            </li>
                            <li class="link">
                                <a href="classes/Field.html" data-type="entity-link">Field</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataActionResource.html" data-type="entity-link">ODataActionResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataAnnotations.html" data-type="entity-link">ODataAnnotations</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataBaseService.html" data-type="entity-link">ODataBaseService</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataBatch.html" data-type="entity-link">ODataBatch</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataBatchResource.html" data-type="entity-link">ODataBatchResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataCallableResource.html" data-type="entity-link">ODataCallableResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataCollection.html" data-type="entity-link">ODataCollection</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataConfig.html" data-type="entity-link">ODataConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataContainer.html" data-type="entity-link">ODataContainer</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataCountResource.html" data-type="entity-link">ODataCountResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataEntitiesAnnotations.html" data-type="entity-link">ODataEntitiesAnnotations</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataEntityAnnotations.html" data-type="entity-link">ODataEntityAnnotations</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataEntityConfig.html" data-type="entity-link">ODataEntityConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataEntityParser.html" data-type="entity-link">ODataEntityParser</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataEntityResource.html" data-type="entity-link">ODataEntityResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataEntitySetResource.html" data-type="entity-link">ODataEntitySetResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataEnumConfig.html" data-type="entity-link">ODataEnumConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataEnumParser.html" data-type="entity-link">ODataEnumParser</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataFieldParser.html" data-type="entity-link">ODataFieldParser</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataFunctionResource.html" data-type="entity-link">ODataFunctionResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataMetadata.html" data-type="entity-link">ODataMetadata</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataMetadataResource.html" data-type="entity-link">ODataMetadataResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataModel.html" data-type="entity-link">ODataModel</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataNavigationPropertyResource.html" data-type="entity-link">ODataNavigationPropertyResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataPathSegments.html" data-type="entity-link">ODataPathSegments</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataPropertyResource.html" data-type="entity-link">ODataPropertyResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataQueryOptions.html" data-type="entity-link">ODataQueryOptions</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataReferenceResource.html" data-type="entity-link">ODataReferenceResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataResource.html" data-type="entity-link">ODataResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataSchema.html" data-type="entity-link">ODataSchema</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataServiceConfig.html" data-type="entity-link">ODataServiceConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataSettings.html" data-type="entity-link">ODataSettings</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataSingletonResource.html" data-type="entity-link">ODataSingletonResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataValueAnnotations.html" data-type="entity-link">ODataValueAnnotations</a>
                            </li>
                            <li class="link">
                                <a href="classes/ODataValueResource.html" data-type="entity-link">ODataValueResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/OptionHandler.html" data-type="entity-link">OptionHandler</a>
                            </li>
                            <li class="link">
                                <a href="classes/SegmentHandler.html" data-type="entity-link">SegmentHandler</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ODataEntityService.html" data-type="entity-link">ODataEntityService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ODataModelService.html" data-type="entity-link">ODataModelService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ODataParser.html" data-type="entity-link">ODataParser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Parser.html" data-type="entity-link">Parser</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});